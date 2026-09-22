/**
 * Critical: the unit/subtotal price shown in the table for a plain product
 * (no third-party pricing plugin active — that's Phase 4) is exactly what
 * ends up charged in the cart.
 *
 * Exercises PricingService::get_display_unit_price()
 * (includes/Services/PricingService.php). See docs/e2e-testing-plan.md,
 * Critical item 4.
 */
import { expect, tags, test } from '../../fixtures/index.js';
import { ProductTablePage } from '../../utils/product-table.page.js';

test(
	"the table's displayed subtotal matches what the cart actually charges",
	{ tag: tags.SMOKE },
	async ( { page, productFactory, bulkOrderTableFactory, wpPageFactory } ) => {
		const product = await productFactory.create( {
			regular_price: '42.00',
			sale_price: '',
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

		await tablePage.setQuantity( product.id, 1 );
		const subtotalText = await tablePage.subtotalCell( product.id ).innerText();
		expect( subtotalText.replace( /[^0-9.]/g, '' ) ).toBe( '42.00' );

		await tablePage.addToCart( product.id );
		// Wait for the add-to-cart request to actually resolve before reading
		// the cart back — clicking only dispatches the click event, it
		// doesn't wait for the store's async Store API call to finish.
		await expect( tablePage.cartQuantityBadge( product.id ) ).toHaveText( '1' );

		const cart = await tablePage.getCart();
		const cartItem = cart.items.find( ( item ) => item.id === product.id );
		expect( cartItem?.quantity ).toBe( 1 );

		const lineSubtotal =
			Number( cartItem.totals.line_subtotal ) /
			10 ** cartItem.totals.currency_minor_unit;
		expect( lineSubtotal ).toBeCloseTo( 42.0, 2 );
	}
);
