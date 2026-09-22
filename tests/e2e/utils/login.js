/**
 * UI login helpers, modeled after WooCommerce's `tests/e2e/utils/login.ts`:
 * plain functions operating on a `Page`, using role/label locators instead
 * of raw CSS selectors, kept out of any Page Object so every spec/page
 * object can share them.
 */

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} username
 * @param {string} password
 */
export async function logIn( page, username, password ) {
	await page.goto( '/wp-login.php' );
	await page.getByLabel( 'Username or Email Address' ).fill( username );
	await page.getByLabel( 'Password', { exact: true } ).fill( password );
	await page.getByRole( 'button', { name: 'Log In' } ).click();
	// Wait for the post-login redirect to actually land before returning —
	// without this, a caller's very next `page.goto()` can fire before
	// WordPress's own redirect completes and cut it off, leaving the
	// browser on the target URL without the auth cookie yet set. This is a
	// real, reasoned defensive fix (a caller-visible race we could
	// construct a failing sequence for), unlike the `.click({delay:100})`
	// step this file briefly carried: that was proposed as the explanation
	// for a one-off "wrong field" observation, but 16 diagnostic repeats
	// (8 sequential, 8 concurrent, with per-field element-identity logging)
	// never reproduced it and confirmed the two locators always resolve to
	// two distinct, correctly-identified inputs (`name="log"` vs
	// `name="pwd"`). That claim wasn't supported by evidence and was
	// removed — see docs/e2e-testing-plan.md.
	//
	// Don't wait for a fixed destination: WordPress/WooCommerce pick the
	// post-login URL based on the account's capabilities, not on this
	// helper's caller — an administrator lands on `/wp-admin/`, but a plain
	// customer/wholesale role (no `edit_posts` capability, like
	// `wholesaleCustomer` in price-stacking-wholesale-and-pricing.spec.js)
	// is sent to `/my-account/` by WooCommerce's own
	// `woocommerce_login_redirect` filter instead — `/wp-admin/` never
	// matches for that account, which is exactly what previously timed out
	// here. Waiting for the URL to simply leave `wp-login.php` is the
	// condition genuinely shared by every account type, without hardcoding
	// any one destination.
	await page.waitForURL( ( url ) => ! url.pathname.includes( 'wp-login.php' ) );
}
