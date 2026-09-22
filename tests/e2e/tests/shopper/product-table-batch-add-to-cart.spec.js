/**
 * Critical: entering quantities on several rows, selecting them, and using
 * "Add selected items to cart" adds every selected row to the real
 * WooCommerce cart with the exact quantities entered.
 *
 * See docs/e2e-testing-plan.md, Critical item 2. Uses the Store API batch
 * endpoint under the hood (apps/packages/common/src/storeApi/index.ts).
 */
import { expect, tags, test } from '../../fixtures/index.js';
import { ProductTablePage } from '../../utils/product-table.page.js';

test(
	'batch add-to-cart adds every selected row with its own quantity',
	{ tag: tags.SMOKE },
	async ( { page, productFactory, bulkOrderTableFactory, wpPageFactory } ) => {
		const firstProduct = await productFactory.create();
		const secondProduct = await productFactory.create();

		const table = await bulkOrderTableFactory.create( {
			query: {
				queryBy: 'hand-picked',
				categories: [],
				products: [ firstProduct.id, secondProduct.id ],
			},
		} );

		const tablePage = new ProductTablePage( page );
		await tablePage.goto( wpPageFactory, table.id );

		await tablePage.setQuantity( firstProduct.id, 3 );
		await tablePage.selectRow( firstProduct.id );
		await tablePage.setQuantity( secondProduct.id, 2 );
		await tablePage.selectRow( secondProduct.id );

		await tablePage.addSelectedToCart();
		await expect( tablePage.cartQuantityBadge( firstProduct.id ) ).toHaveText(
			'3'
		);
		await expect( tablePage.cartQuantityBadge( secondProduct.id ) ).toHaveText(
			'2'
		);

		// Business outcome: assert the real WooCommerce cart, not just the
		// table's own optimistic UI state.
		const cart = await tablePage.getCart();
		const firstItem = cart.items.find( ( item ) => item.id === firstProduct.id );
		const secondItem = cart.items.find(
			( item ) => item.id === secondProduct.id
		);

		expect( firstItem?.quantity ).toBe( 3 );
		expect( secondItem?.quantity ).toBe( 2 );
	}
);
