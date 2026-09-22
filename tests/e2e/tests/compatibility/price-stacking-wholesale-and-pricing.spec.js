/**
 * Compatibility (Critical, per docs/e2e-testing-plan.md section 4): Yay
 * Wholesale B2B and YayPricing both adjust price through the SAME hook
 * (`yaybulkorder_adjust_raw_price` — see
 * includes/Services/PricingService.php), Wholesale at priority 10 and
 * YayPricing at priority 20 (includes/Engines/Compatibles/{YayWholesale,
 * YayPricing}.php). That's a deliberate design: the discounts are meant to
 * COMPOUND (wholesale first, then YayPricing on top of the already-
 * discounted price), not for one to override the other. This is the
 * highest-priority Phase 4 check (TASK.md ranks it first).
 *
 * Only meaningful with BOTH plugins active — i.e. the `with-all-yay` combo;
 * skips itself under any combo missing one of the two, so the same spec
 * file runs unmodified across every `.wp-env.<combo>.json`.
 */
import { expect, tags, test } from '../../fixtures/compat/index.js';
import { logIn } from '../../utils/login.js';
import { ProductTablePage } from '../../utils/product-table.page.js';
import { isPluginActive } from '../../utils/wp-plugins.js';

test(
	'wholesale (20% off) and YayPricing (10% off) discounts compound, wholesale first',
	// Setup chains several `wp-env run cli` calls (role + user + rule), each
	// a couple of seconds of Docker-exec overhead on top of the usual
	// browser actions — comfortably over Playwright's 30s default.
	{ tag: tags.REGRESSION, timeout: 90_000 },
	async ( {
		page,
		productFactory,
		bulkOrderTableFactory,
		wpPageFactory,
		wholesaleCustomer,
		pricingRule,
	} ) => {
		test.skip(
			! ( await isPluginActive( 'yay-wholesale-b2b' ) ) ||
				! ( await isPluginActive( 'yaypricing' ) ),
			'Requires both Yay Wholesale B2B and YayPricing active (the with-all-yay combo).'
		);
		void pricingRule; // 10% off every product, active for this test; see the fixture.

		const product = await productFactory.create( {
			regular_price: '100.00',
			sale_price: '',
		} );

		const table = await bulkOrderTableFactory.create( {
			query: {
				queryBy: 'hand-picked',
				categories: [],
				products: [ product.id ],
			},
		} );

		await logIn( page, wholesaleCustomer.username, wholesaleCustomer.password );

		const tablePage = new ProductTablePage( page );
		await tablePage.goto( wpPageFactory, table.id );
		await tablePage.setQuantity( product.id, 1 );

		// 100 -[wholesale 20% off]-> 80 -[yaypricing 10% off]-> 72.
		const subtotalText = await tablePage.subtotalCell( product.id ).innerText();
		expect( Number( subtotalText.replace( /[^0-9.]/g, '' ) ) ).toBeCloseTo( 72, 1 );

		await tablePage.addToCart( product.id );
		await expect( tablePage.cartQuantityBadge( product.id ) ).toHaveText( '1' );

		const cart = await tablePage.getCart();
		const cartItem = cart.items.find( ( item ) => item.id === product.id );
		const unitPrice =
			Number( cartItem.totals.line_subtotal ) /
			10 ** cartItem.totals.currency_minor_unit;
		expect( unitPrice ).toBeCloseTo( 72, 1 );
	}
);
