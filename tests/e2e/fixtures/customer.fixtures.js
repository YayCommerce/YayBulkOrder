/**
 * `customer` fixture — a single WooCommerce customer account.
 */
import { faker } from '@faker-js/faker';

import { WC_API_PATH } from '../utils/api.js';
import { test as base } from './fixtures.js';

export const test = base.extend( {
	customer: async ( { restApi }, use ) => {
		const suffix = faker.string.alphanumeric( 8 ).toLowerCase();

		const response = await restApi.post( `${ WC_API_PATH }/customers`, {
			data: {
				email: `e2e-customer-${ suffix }@example.com`,
				first_name: faker.person.firstName(),
				last_name: faker.person.lastName(),
				username: `e2e_customer_${ suffix }`,
				password: 'Password!123',
			},
		} );
		const customer = await response.json();

		await use( customer );

		await restApi.delete( `${ WC_API_PATH }/customers/${ customer.id }`, {
			data: { force: true },
		} );
	},
} );

export { expect, tags } from './fixtures.js';
