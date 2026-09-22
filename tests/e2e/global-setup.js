/**
 * One-time environment preparation, run before the whole Playwright suite.
 *
 * Uses WP-CLI inside the wp-env "cli" container (never the admin UI) to:
 *   1. Activate WooCommerce and this plugin.
 *   2. Switch to a pretty permalink structure (WooCommerce/the REST API
 *      both expect one).
 *   3. Make sure the e2e admin test user exists with a known password.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { wpCLI } from './utils/cli.js';
import { admin } from './utils/test-data.js';

const __dirname = path.dirname( fileURLToPath( import.meta.url ) );

// The plugin is mounted into wp-content/plugins/ under the basename of the
// path given in .wp-env.json's "plugins" entry ("../.." from tests/e2e/,
// i.e. this repo's own root folder) — read it dynamically instead of
// hardcoding a folder name that could change if the repo is cloned/renamed.
const PLUGIN_SLUG = path.basename( path.resolve( __dirname, '..', '..' ) );

async function ensureAdminUser() {
	const { stdout } = await wpCLI( [
		'user',
		'list',
		'--field=user_login',
	] );
	const exists = stdout
		.split( '\n' )
		.map( ( line ) => line.trim() )
		.includes( admin.username );

	if ( exists ) {
		await wpCLI( [
			'user',
			'update',
			admin.username,
			`--user_pass=${ admin.password }`,
			'--role=administrator',
		] );
		return;
	}

	await wpCLI( [
		'user',
		'create',
		admin.username,
		admin.email,
		'--role=administrator',
		`--user_pass=${ admin.password }`,
	] );
}

export default async function globalSetup() {
	console.log( '[global-setup] Activating WooCommerce...' );
	await wpCLI( [ 'plugin', 'activate', 'woocommerce' ] );

	console.log( `[global-setup] Activating ${ PLUGIN_SLUG }...` );
	await wpCLI( [ 'plugin', 'activate', PLUGIN_SLUG ] );

	console.log( '[global-setup] Setting permalink structure...' );
	await wpCLI( [ 'rewrite', 'structure', '/%postname%/', '--hard' ] );
	await wpCLI( [ 'rewrite', 'flush', '--hard' ] );

	// A fresh WooCommerce install defaults new stores to "Coming soon" mode
	// (`woocommerce_coming_soon: 'yes'`), which replaces store pages —
	// including Checkout — with a placeholder landing page for anyone not
	// logged in. Off here so specs exercise the real storefront, the way a
	// launched store behaves.
	console.log( '[global-setup] Turning off "Coming soon" store mode...' );
	await wpCLI( [ 'option', 'update', 'woocommerce_coming_soon', 'no' ] );

	console.log( '[global-setup] Ensuring the e2e admin test user exists...' );
	await ensureAdminUser();

	console.log( '[global-setup] Done.' );
}
