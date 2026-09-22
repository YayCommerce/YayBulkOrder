/**
 * `orderFactory` fixture — unlike `product`/`customer`/`coupon`, an order's
 * shape (line items, status, billing customer) varies a lot per test, so
 * this exposes a `create()` factory instead of one fixed instance. Every
 * order created through it during the test is tracked and force-deleted in
 * teardown, so a spec never has to remember cleanup itself.
 */
import { WC_API_PATH } from '../utils/api.js';
import { test as base } from './fixtures.js';

export const test = base.extend( {
	orderFactory: async ( { restApi }, use ) => {
		const createdOrderIds = [];

		await use( {
			/**
			 * @param {object} payload See the WooCommerce REST API's "Create an
			 *   order" request body (e.g. `{ line_items: [{ product_id, quantity }] }`).
			 */
			create: async ( payload ) => {
				const response = await restApi.post(
					`${ WC_API_PATH }/orders`,
					{ data: payload }
				);
				const order = await response.json();
				createdOrderIds.push( order.id );
				return order;
			},
		} );

		for ( const orderId of createdOrderIds ) {
			await restApi.delete( `${ WC_API_PATH }/orders/${ orderId }`, {
				data: { force: true },
			} );
		}
	},
} );

export { expect, tags } from './fixtures.js';
