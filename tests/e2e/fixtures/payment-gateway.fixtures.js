/**
 * `codPaymentGateway` — temporarily enables "Cash on delivery" (a fresh
 * WooCommerce install ships with every gateway disabled, so checkout has
 * nothing to pay with otherwise), restoring whatever it was before.
 *
 * This flips a GLOBAL WooCommerce setting, not per-test data — per the
 * fullyParallel note in playwright.config.js, only ever use this fixture
 * from a spec file with exactly ONE test, so two parallel workers can never
 * race to enable/restore it against each other.
 */
import { WC_API_PATH } from '../utils/api.js';
import { test as base } from './fixtures.js';

export const test = base.extend( {
	codPaymentGateway: async ( { restApi }, use ) => {
		const before = await (
			await restApi.get( `${ WC_API_PATH }/payment_gateways/cod` )
		).json();

		await restApi.put( `${ WC_API_PATH }/payment_gateways/cod`, {
			data: { enabled: true },
		} );

		await use();

		await restApi.put( `${ WC_API_PATH }/payment_gateways/cod`, {
			data: { enabled: before.enabled },
		} );
	},
} );

export { expect, tags } from './fixtures.js';
