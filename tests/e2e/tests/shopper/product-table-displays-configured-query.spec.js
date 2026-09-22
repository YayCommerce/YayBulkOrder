/**
 * Critical: a Product Table created via REST (no admin UI) renders the
 * product query it was configured with, on the storefront.
 *
 * See docs/e2e-testing-plan.md, Critical item 1.
 */
import { expect, tags, test } from '../../fixtures/index.js';
import { ProductTablePage } from '../../utils/product-table.page.js';

test.describe( 'Product Table renders its configured product query', () => {
	test(
		'"all products" shows the table on the storefront with the product in it',
		{ tag: tags.SMOKE },
		async ( { page, bulkOrderTable, product, wpPageFactory } ) => {
			const tablePage = new ProductTablePage( page );
			await tablePage.goto( wpPageFactory, bulkOrderTable.id );

			await expect( tablePage.row( product.id ) ).toBeVisible();
		}
	);

	test(
		'"hand-picked" shows only the selected product, not the rest of the catalog',
		{ tag: tags.SMOKE },
		async ( { page, bulkOrderTableFactory, product, wpPageFactory } ) => {
			const table = await bulkOrderTableFactory.create( {
				query: {
					queryBy: 'hand-picked',
					categories: [],
					products: [ product.id ],
				},
			} );

			const tablePage = new ProductTablePage( page );
			await tablePage.goto( wpPageFactory, table.id );

			await expect( tablePage.row( product.id ) ).toBeVisible();
			// Hand-picked must restrict the query to exactly the given ids,
			// regardless of how many other products exist concurrently
			// (other parallel workers create their own).
			await expect( page.locator( 'tr[data-wp-key]' ) ).toHaveCount( 1 );
		}
	);
} );
