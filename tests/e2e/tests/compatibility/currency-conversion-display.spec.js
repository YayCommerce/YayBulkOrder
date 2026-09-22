/**
 * Compatibility (per docs/e2e-testing-plan.md section 4): the bulk order
 * table shows the correct symbol and converted amount once a visitor
 * switches currency via YayCurrency.
 *
 * This works "for free" because YayCurrency filters the standard WooCommerce
 * `woocommerce_product_get_price` (and sibling) filters directly
 * (includes/Engine/FEPages/WooCommerceCurrency.php in the downloaded
 * plugin), and YayBulkOrder's own PricingService::get_display_unit_price()
 * deliberately re-applies that exact filter after reading the product's raw
 * price — the same integration point YayPricing/Yay Wholesale B2B's
 * compatibility adapters use (yaybulkorder_adjust_raw_price), just via a
 * WooCommerce core filter instead of a plugin-specific action.
 */
import { expect, tags, test } from '../../fixtures/compat/index.js';
import { ProductTablePage } from '../../utils/product-table.page.js';
import { isPluginActive } from '../../utils/wp-plugins.js';

test(
	'switching to a secondary currency updates the displayed price and symbol',
	// The secondaryCurrency fixture's `wp eval` setup is a couple of seconds
	// of Docker-exec overhead on top of the usual browser actions.
	{ tag: tags.REGRESSION, timeout: 60_000 },
	async ( {
		page,
		context,
		productFactory,
		bulkOrderTableFactory,
		wpPageFactory,
		secondaryCurrency,
	} ) => {
		test.skip(
			! ( await isPluginActive( 'yaycurrency' ) ),
			'Requires YayCurrency active.'
		);

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

		// YayCurrency reads the active currency from this cookie
		// (YayCurrencyHelper.php), valued with the currency post's ID.
		const baseURL =
			process.env.BASE_URL ||
			`http://localhost:${ process.env.WP_ENV_PORT || 8886 }`;
		await context.addCookies( [
			{
				name: 'yay_currency_widget',
				value: String( secondaryCurrency.id ),
				url: baseURL,
			},
		] );

		const tablePage = new ProductTablePage( page );
		await tablePage.goto( wpPageFactory, table.id );
		await tablePage.setQuantity( product.id, 1 );

		const subtotalText = await tablePage.subtotalCell( product.id ).innerText();
		expect( subtotalText ).toContain( secondaryCurrency.symbol );
		// 100 (base currency) at a fixed 0.5x rate.
		expect( Number( subtotalText.replace( /[^0-9.]/g, '' ) ) ).toBeCloseTo(
			100 * secondaryCurrency.rate,
			1
		);
	}
);
