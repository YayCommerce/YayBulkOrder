/**
 * `hposEnabled` — temporarily turns on WooCommerce's "High-Performance
 * Order Storage" feature (`custom_order_tables`), restoring whatever it was
 * before. This environment ships with it OFF by default (verified against
 * the running wp-env instance), unlike a WooCommerce install completed
 * through the admin setup wizard.
 *
 * A GLOBAL WooCommerce feature flag, not per-test data — like
 * `codPaymentGateway`, only ever use this from a spec file with exactly ONE
 * test, so two parallel workers can't race to enable/restore it.
 */
import { wpCLI } from '../utils/cli.js';
import { test as base } from './fixtures.js';

const FEATURE_CONTROLLER =
	'wc_get_container()->get(\\Automattic\\WooCommerce\\Internal\\Features\\FeaturesController::class)';

async function isCustomOrderTablesEnabled() {
	const { stdout } = await wpCLI( [
		'eval',
		`echo ${ FEATURE_CONTROLLER }->feature_is_enabled('custom_order_tables') ? 'yes' : 'no';`,
	] );
	return stdout.trim() === 'yes';
}

async function setCustomOrderTablesEnabled( enabled ) {
	await wpCLI( [
		'eval',
		`echo ${ FEATURE_CONTROLLER }->change_feature_enable('custom_order_tables', ${ enabled ? 'true' : 'false' } ) ? 'ok' : 'fail';`,
	] );
}

export const test = base.extend( {
	hposEnabled: async ( {}, use ) => {
		const wasEnabled = await isCustomOrderTablesEnabled();

		await setCustomOrderTablesEnabled( true );
		await use();
		await setCustomOrderTablesEnabled( wasEnabled );
	},
} );

export { expect, tags } from './fixtures.js';
