/**
 * Important: the plugin's general settings (`GET`/`POST
 * yay-bulk-order/v1/settings`, backed by the `yay_bulk_order_settings`
 * option) round-trip correctly and require both `manage_options` and
 * `manage_woocommerce` (SettingsRestController::can_manage_settings()).
 *
 * See docs/e2e-testing-plan.md, Important item 7.
 *
 * The first test below mutates the GLOBAL `yay_bulk_order_settings` option
 * and restores it afterward. This is safe under `fullyParallel` ONLY
 * because SettingsService::save_settings() merges a partial payload onto
 * the currently stored settings (see the fix in includes/Services/
 * SettingsService.php) — before that fix, this test's partial
 * `{ general: {...} }` POST silently reset every other settings group
 * (`csvOrder`, `purchaseList`, `colors`, ...) back to its default,
 * intermittently breaking any concurrently-running spec that depends on
 * one of those (e.g. csv-quick-order-add-to-cart.spec.js's
 * `csvOrder.isAddToAccountPage`). If save_settings() ever goes back to
 * merging onto bare defaults, this test must send the full settings object
 * instead of a partial one, or move to `test.describe.serial` with the
 * specs it could clobber.
 */
import { expect, tags, test } from '../../fixtures/index.js';
import { createRestApiContext, YBO_API_PATH } from '../../utils/api.js';

test(
	'GET/POST round-trips general settings',
	{ tag: tags.REGRESSION },
	async ( { restApi } ) => {
		const before = await (
			await restApi.get( `${ YBO_API_PATH }/settings` )
		).json();
		expect( before.general ).toBeTruthy();

		const updateResponse = await restApi.post( `${ YBO_API_PATH }/settings`, {
			data: {
				general: { defaultCartQuantity: 7, defaultPageSize: 8 },
			},
		} );
		const updated = await updateResponse.json();
		expect( updated.general.defaultCartQuantity ).toBe( 7 );
		expect( updated.general.defaultPageSize ).toBe( 8 );

		const reread = await (
			await restApi.get( `${ YBO_API_PATH }/settings` )
		).json();
		expect( reread.general.defaultCartQuantity ).toBe( 7 );
		expect( reread.general.defaultPageSize ).toBe( 8 );

		await restApi.post( `${ YBO_API_PATH }/settings`, { data: before } );
	}
);

test(
	'requires manage_options AND manage_woocommerce',
	{ tag: tags.REGRESSION },
	async ( { baseURL, customer } ) => {
		const customerApi = await createRestApiContext( baseURL, {
			username: customer.email,
			password: 'Password!123',
		} );

		const response = await customerApi.get( `${ YBO_API_PATH }/settings` );
		expect( response.status() ).toBe( 403 );

		await customerApi.dispose();
	}
);
