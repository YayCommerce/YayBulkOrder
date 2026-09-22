/**
 * Thin REST API client used by fixtures to set up / tear down test data.
 *
 * WooCommerce's own e2e suite authenticates its `restApi` fixture with Basic
 * Auth against the admin user (see `tests/e2e/fixtures/fixtures.ts` in
 * woocommerce/woocommerce) rather than reusing a logged-in browser session —
 * REST calls should not depend on the UI being up. We follow the same
 * approach here, via Playwright's own `request` context instead of a
 * bespoke HTTP client.
 */
import { request } from '@playwright/test';

/**
 * @param {string} baseURL
 * @param {{ username: string, password: string }} credentials
 * @return {Promise<import('@playwright/test').APIRequestContext>}
 */
export async function createRestApiContext( baseURL, credentials ) {
	const token = Buffer.from(
		`${ credentials.username }:${ credentials.password }`
	).toString( 'base64' );

	return request.newContext( {
		baseURL,
		extraHTTPHeaders: {
			Authorization: `Basic ${ token }`,
		},
	} );
}

/** Base path for this plugin's own REST namespace (see includes/Controllers/BaseRestController.php). */
export const YBO_API_PATH = '/wp-json/yay-bulk-order/v1';

/** Base path for WooCommerce's REST API. */
export const WC_API_PATH = '/wp-json/wc/v3';

/** Base path for WordPress core's REST API. */
export const WP_API_PATH = '/wp-json/wp/v2';
