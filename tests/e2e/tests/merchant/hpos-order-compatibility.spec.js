/**
 * Important: the plugin declares compatibility with WooCommerce's
 * High-Performance Order Storage (`custom_order_tables`) in
 * `YayBulkOrder::before_woocommerce_init()`. This confirms that declaration
 * doesn't block turning HPOS on, and that basic order create/read still
 * works correctly once it's the active storage.
 *
 * See docs/e2e-testing-plan.md, Important item 11.
 *
 * Single test in this file — see the `hposEnabled` fixture's own comment
 * for why a spec using it must stay to exactly one test.
 *
 * The order is created and deleted directly through `restApi` here rather
 * than via the `orderFactory` fixture: WooCommerce refuses to switch HPOS
 * back off while any order is "out of sync", so the order this test creates
 * MUST be deleted before the test function returns — before
 * `hposEnabled`'s teardown (which runs right after, in reverse setup order)
 * tries to disable it again.
 */
import { expect, tags, test } from '../../fixtures/index.js';

test(
	'orders can be created and read back correctly with HPOS enabled',
	{ tag: tags.REGRESSION },
	async ( { restApi, product, hposEnabled } ) => {
		void hposEnabled; // turns on custom_order_tables for this test; see the fixture.

		const createResponse = await restApi.post( '/wp-json/wc/v3/orders', {
			data: { line_items: [ { product_id: product.id, quantity: 4 } ] },
		} );
		const order = await createResponse.json();

		const fetched = await (
			await restApi.get( `/wp-json/wc/v3/orders/${ order.id }` )
		).json();

		expect( fetched.line_items ).toHaveLength( 1 );
		expect( fetched.line_items[ 0 ].product_id ).toBe( product.id );
		expect( fetched.line_items[ 0 ].quantity ).toBe( 4 );

		await restApi.delete( `/wp-json/wc/v3/orders/${ order.id }`, {
			data: { force: true },
		} );
	}
);
