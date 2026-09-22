/**
 * Base test object extended with an authenticated REST API fixture.
 *
 * Modeled after WooCommerce's `tests/e2e/fixtures/fixtures.ts`: a `restApi`
 * fixture backed by Basic Auth against the admin user, so any entity
 * fixture (product, product table, ...) can create/clean up data over REST
 * instead of clicking through the admin UI.
 *
 * Entity-specific fixtures (product, bulkOrderTable, ...) are added here in
 * Phase 2, each creating its data before `use()` and deleting it after.
 */
import { test as baseTest, expect as baseExpect } from '@playwright/test';

import { createRestApiContext } from '../utils/api.js';
import { admin } from '../utils/test-data.js';

export const test = baseTest.extend( {
	restApi: async ( { baseURL }, use ) => {
		if ( ! baseURL ) {
			throw new Error(
				'Playwright baseURL is required to use the restApi fixture.'
			);
		}

		const context = await createRestApiContext( baseURL, admin );
		await use( context );
		await context.dispose();
	},
} );

export const expect = baseExpect;

/** Shared tag constants, so specs never risk a typo'd tag string. */
export const tags = {
	SMOKE: '@smoke',
	REGRESSION: '@regression',
};
