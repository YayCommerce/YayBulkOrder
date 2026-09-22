/**
 * `coupon` fixture — a single percentage-discount coupon with a random,
 * collision-proof code.
 */
import { faker } from '@faker-js/faker';

import { WC_API_PATH } from '../utils/api.js';
import { test as base } from './fixtures.js';

export const test = base.extend( {
	coupon: async ( { restApi }, use ) => {
		const response = await restApi.post( `${ WC_API_PATH }/coupons`, {
			data: {
				code: `e2e-${ faker.string.alphanumeric( 10 ).toLowerCase() }`,
				discount_type: 'percent',
				amount: '10',
			},
		} );
		const coupon = await response.json();

		await use( coupon );

		await restApi.delete( `${ WC_API_PATH }/coupons/${ coupon.id }`, {
			data: { force: true },
		} );
	},
} );

export { expect, tags } from './fixtures.js';
