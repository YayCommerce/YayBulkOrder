/**
 * `categoryFactory` — WooCommerce product categories (`product_cat` terms),
 * for tests exercising a Product Table's "filter by category" query mode.
 */
import { faker } from '@faker-js/faker';

import { WC_API_PATH } from '../utils/api.js';
import { test as base } from './fixtures.js';

export const test = base.extend( {
	categoryFactory: async ( { restApi }, use ) => {
		const createdCategoryIds = [];

		await use( {
			create: async ( overrides = {} ) => {
				const response = await restApi.post(
					`${ WC_API_PATH }/products/categories`,
					{
						data: {
							name: `E2E Category ${ faker.string.alphanumeric( 8 ) }`,
							...overrides,
						},
					}
				);
				const category = await response.json();
				createdCategoryIds.push( category.id );
				return category;
			},
		} );

		for ( const categoryId of createdCategoryIds ) {
			await restApi.delete(
				`${ WC_API_PATH }/products/categories/${ categoryId }`,
				{ data: { force: true } }
			);
		}
	},
} );

export { expect, tags } from './fixtures.js';
