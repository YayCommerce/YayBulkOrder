/**
 * Compatibility (general, per docs/e2e-testing-plan.md section 4 — "chung
 * cho cả 4 plugin"): with every Yay plugin present in the current wp-env
 * combo active alongside WooCommerce and this plugin —
 *   1. none report a broken/inactive status,
 *   2. the bulk order table's add-to-cart still works end to end,
 *   3. no PHP fatal error is logged (soft: notices/deprecations are logged
 *      to the test output but don't fail it — see TASK.md's own "warning
 *      nhẹ không chặn merge, fatal error thì phải fail" wording),
 *   4. no browser console error fires,
 *   5. each Yay plugin's admin settings page loads under its own distinct
 *      menu slug (verified against the real downloaded plugins: 'yayextra',
 *      'yay-currency-settings', 'yay_wholesale_b2b', vs. this plugin's own
 *      'yay_bulk_order' — no collision found by inspecting their
 *      PluginAdapter classes).
 *
 * Runs against WHATEVER Yay plugins the current wp-env combo actually
 * installs — including zero of them (the `only-bulk-order` baseline) — so
 * this same file is meaningful across every `.wp-env.<combo>.json`.
 */
import { expect, tags, test } from '../../fixtures/compat/index.js';
import { wpCLI } from '../../utils/cli.js';
import { logIn } from '../../utils/login.js';
import { ProductTablePage } from '../../utils/product-table.page.js';
import { admin } from '../../utils/test-data.js';

const YAY_ADMIN_SLUGS = {
	'yay-wholesale-b2b': 'yay_wholesale_b2b',
	yaycurrency: 'yay-currency-settings',
	yayextra: 'yayextra',
};

test(
	'every active plugin stays healthy, and add-to-cart keeps working, with all of them loaded together',
	{ tag: tags.SMOKE },
	async ( { page, productFactory, bulkOrderTableFactory, wpPageFactory } ) => {
		const { stdout: pluginListJSON } = await wpCLI( [
			'plugin',
			'list',
			'--status=active',
			'--format=json',
		] );
		const activePlugins = JSON.parse( pluginListJSON );
		const activeSlugs = new Set( activePlugins.map( ( p ) => p.name ) );

		// WooCommerce + this plugin must always be active; WP-API/Basic-Auth
		// ("master", from the GitHub branch zip) is this suite's own
		// auth mechanism. `wp plugin list --status=active` only lists
		// plugins that ARE active, so bundled-but-inactive ones (akismet,
		// hello) never show up here to false-fail this loop.
		for ( const requiredSlug of [ 'woocommerce', 'master' ] ) {
			expect(
				activeSlugs.has( requiredSlug ),
				`${ requiredSlug } should be active`
			).toBe( true );
		}
		const thisPluginActive = [ ...activeSlugs ].some( ( slug ) =>
			slug.toLowerCase().includes( 'yaybulkorder' )
		);
		expect( thisPluginActive, 'this plugin should be active' ).toBe( true );

		// Reset the debug log so only what THIS test's actions cause shows up.
		await wpCLI( [
			'eval',
			"file_put_contents( WP_CONTENT_DIR . '/debug.log', '' );",
		] );

		const consoleErrors = [];
		page.on( 'console', ( message ) => {
			if ( message.type() === 'error' ) {
				consoleErrors.push( message.text() );
			}
		} );
		page.on( 'pageerror', ( error ) => consoleErrors.push( String( error ) ) );

		const product = await productFactory.create( {
			regular_price: '20.00',
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
		await tablePage.setQuantity( product.id, 3 );
		await tablePage.addToCart( product.id );
		await expect( tablePage.cartQuantityBadge( product.id ) ).toHaveText( '3' );

		const cart = await tablePage.getCart();
		expect( cart.items.some( ( item ) => item.id === product.id ) ).toBe(
			true
		);

		expect(
			consoleErrors,
			`Browser console errors while the table was on screen:\n${ consoleErrors.join( '\n' ) }`
		).toHaveLength( 0 );

		const { stdout: logContent } = await wpCLI( [
			'eval',
			"echo @file_get_contents( WP_CONTENT_DIR . '/debug.log' );",
		] );
		const fatalLines = logContent
			.split( '\n' )
			.filter( ( line ) => /PHP Fatal error/i.test( line ) );
		expect(
			fatalLines,
			`PHP fatal error(s) logged:\n${ fatalLines.join( '\n' ) }`
		).toHaveLength( 0 );

		const nonFatalLines = logContent
			.split( '\n' )
			.filter( ( line ) => /PHP (Warning|Notice|Deprecated)/i.test( line ) );
		if ( nonFatalLines.length ) {
			// Soft signal only — TASK.md: a light warning shouldn't block merging.
			console.warn(
				`[all-yay-plugins-smoke] Non-fatal PHP log lines (not failing the test):\n${ nonFatalLines.join( '\n' ) }`
			);
		}

		// Each active Yay plugin's admin settings page should load under its
		// own distinct slug, not collide with another's.
		await logIn( page, admin.username, admin.password );
		for ( const [ pluginSlug, adminSlug ] of Object.entries(
			YAY_ADMIN_SLUGS
		) ) {
			if ( ! activeSlugs.has( pluginSlug ) ) {
				continue;
			}
			const response = await page.goto(
				`/wp-admin/admin.php?page=${ adminSlug }`
			);
			expect(
				response?.status(),
				`${ pluginSlug }'s settings page (page=${ adminSlug })`
			).toBeLessThan( 400 );
		}
	}
);
