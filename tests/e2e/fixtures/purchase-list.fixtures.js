/**
 * `purchaseList` fixture — the Pro "Purchase List" entity
 * (`ybo_purchase_list`, includes/Pro/Services/PurchaseListService.php),
 * pre-loaded with one line item pointing at the `product` fixture.
 *
 * Built through the plugin's own REST route (`POST .../purchase-list`),
 * which only requires a logged-in user (`can_manage_purchase_list()`) —
 * our Basic-Auth admin session satisfies that.
 */
import { faker } from '@faker-js/faker';

import { YBO_API_PATH } from '../utils/api.js';
import { test as base } from './product.fixtures.js';

export const test = base.extend( {
	purchaseList: async ( { restApi, product }, use ) => {
		const response = await restApi.post( `${ YBO_API_PATH }/purchase-list`, {
			data: {
				name: `E2E Purchase List ${ faker.string.alphanumeric( 6 ) }`,
				// `productId`, not `id` — matches what both the client store
				// (purchaseList.store.ts) and the add-to-cart AJAX handler
				// (PurchaseList::add_purchase_list_to_cart(), which reads
				// `$product['productId']`) expect.
				products: [ { productId: product.id, quantity: 2 } ],
			},
		} );
		const purchaseList = await response.json();

		await use( purchaseList );

		await restApi.delete(
			`${ YBO_API_PATH }/purchase-list/${ purchaseList.id }`
		);
	},
} );

export { expect, tags } from './fixtures.js';
