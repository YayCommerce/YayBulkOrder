/**
 * Pipeline sanity check for Phase 1: confirms Docker → wp-env → Playwright →
 * browser all work end to end, and that the plugin activates cleanly
 * alongside WooCommerce. Superseded by real specs once Phase 3 starts, but
 * harmless to keep as a fast canary.
 */
import { expect, test } from '../fixtures/index.js';

test( 'site is up and the plugin is active', async ( { page, restApi } ) => {
	await page.goto( '/' );
	await expect( page ).toHaveTitle( /.+/ );

	const response = await restApi.get( '/wp-json/yay-bulk-order/v1/settings' );
	expect( response.ok() ).toBeTruthy();
} );
