/**
 * Critical: after adding a product to the cart through the bulk order
 * table, checkout completes and creates a WooCommerce order with the
 * correct line item, quantity and total.
 *
 * See docs/e2e-testing-plan.md, Critical item 5. Uses a virtual product so
 * the assertion stays focused on the plugin's own add-to-cart → checkout
 * path, rather than on WooCommerce's shipping-zone configuration (out of
 * this plugin's scope).
 *
 * Single test in this file — see the `codPaymentGateway` fixture's own
 * comment for why a spec using it must stay to exactly one test.
 */
import { expect, tags, test } from '../../fixtures/index.js';
import { CheckoutPage } from '../../utils/checkout.page.js';
import { ProductTablePage } from '../../utils/product-table.page.js';

test(
	'checkout completes and creates an order matching what was added from the table',
	{ tag: tags.SMOKE },
	async ( {
		page,
		restApi,
		productFactory,
		bulkOrderTableFactory,
		wpPageFactory,
		codPaymentGateway,
	} ) => {
		void codPaymentGateway; // enables Cash on delivery for this test; see the fixture.

		const product = await productFactory.create( {
			regular_price: '42.00',
			sale_price: '',
			virtual: true,
		} );

		const table = await bulkOrderTableFactory.create( {
			query: {
				queryBy: 'hand-picked',
				categories: [],
				products: [ product.id ],
			},
		} );

		const tablePage = new ProductTablePage( page );
		await tablePage.goto( wpPageFactory, table.id );
		await tablePage.setQuantity( product.id, 2 );
		await tablePage.addToCart( product.id );
		await expect( tablePage.cartQuantityBadge( product.id ) ).toHaveText( '2' );

		const checkoutPage = new CheckoutPage( page );
		await checkoutPage.goto();
		await checkoutPage.fillBillingDetails( {
			email: 'e2e-checkout@example.com',
			firstName: 'Jane',
			lastName: 'Doe',
			address1: '123 Main St',
			city: 'New York',
			countryCode: 'US',
			state: 'NY',
			postcode: '10001',
			phone: '2025550123',
		} );
		await checkoutPage.selectPaymentMethod( 'cod' );
		await checkoutPage.placeOrder();

		const orderId = Number(
			new URL( page.url() ).pathname.match( /order-received\/(\d+)/ )?.[ 1 ]
		);
		expect( orderId ).toBeGreaterThan( 0 );

		const order = await (
			await restApi.get( `/wp-json/wc/v3/orders/${ orderId }` )
		).json();

		expect( order.line_items ).toHaveLength( 1 );
		expect( order.line_items[ 0 ].product_id ).toBe( product.id );
		expect( order.line_items[ 0 ].quantity ).toBe( 2 );
		expect( Number( order.total ) ).toBeCloseTo( 84.0, 2 );
		expect( [ 'processing', 'on-hold', 'completed' ] ).toContain(
			order.status
		);

		await restApi.delete( `/wp-json/wc/v3/orders/${ orderId }`, {
			data: { force: true },
		} );
	}
);
