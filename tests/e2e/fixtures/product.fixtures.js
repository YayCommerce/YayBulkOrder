/**
 * `productFactory` — creates published, simple WooCommerce products on
 * demand, each with randomized name/SKU/price (faker) so concurrent workers
 * never collide, tracked and force-deleted in teardown.
 *
 * `product` is the common case (one product, default price range) built on
 * top of it — most specs only need one and shouldn't have to spell out
 * `productFactory.create()` themselves.
 */
import { faker } from '@faker-js/faker';

import { WC_API_PATH } from '../utils/api.js';
import { test as base } from './fixtures.js';

export const test = base.extend( {
	productFactory: async ( { restApi }, use ) => {
		const createdProductIds = [];

		await use( {
			/** @param {object} [overrides] Merged over the product's default payload. */
			create: async ( overrides = {} ) => {
				const response = await restApi.post( `${ WC_API_PATH }/products`, {
					data: {
						name: `E2E Product ${ faker.commerce.productName() } ${ faker.string.alphanumeric( 6 ) }`,
						type: 'simple',
						regular_price: faker.commerce.price( { min: 10, max: 200, dec: 2 } ),
						sku: `e2e-${ faker.string.alphanumeric( 10 ).toLowerCase() }`,
						manage_stock: true,
						stock_quantity: 100,
						status: 'publish',
						...overrides,
					},
				} );
				const product = await response.json();
				createdProductIds.push( product.id );
				return product;
			},
		} );

		for ( const productId of createdProductIds ) {
			await restApi.delete( `${ WC_API_PATH }/products/${ productId }`, {
				data: { force: true },
			} );
		}
	},

	product: async ( { productFactory }, use ) => {
		await use( await productFactory.create() );
	},
} );

export { expect, tags } from './fixtures.js';
