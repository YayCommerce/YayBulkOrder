/**
 * Important: with pagination enabled and a page size smaller than the
 * result count, the table splits results across pages and paging forward
 * shows the rest.
 *
 * See docs/e2e-testing-plan.md, Important item 10.
 */
import { expect, tags, test } from '../../fixtures/index.js';
import { ProductTablePage } from '../../utils/product-table.page.js';

test(
	'pagination splits a 3-product hand-picked query across 2-per-page pages',
	{ tag: tags.REGRESSION },
	async ( { page, productFactory, bulkOrderTableFactory, wpPageFactory } ) => {
		const products = await Promise.all( [
			productFactory.create(),
			productFactory.create(),
			productFactory.create(),
		] );

		const table = await bulkOrderTableFactory.create( {
			query: {
				queryBy: 'hand-picked',
				categories: [],
				products: products.map( ( p ) => p.id ),
			},
			features: {
				hasFilter: false,
				hasSearch: false,
				hasPagination: true,
				pageSize: 2,
			},
		} );

		const tablePage = new ProductTablePage( page );
		await tablePage.goto( wpPageFactory, table.id );

		await expect( page.locator( 'tr[data-wp-key]' ) ).toHaveCount( 2 );

		await tablePage.paginationLink( 2 ).click();
		await expect( page.locator( 'tr[data-wp-key]' ) ).toHaveCount( 1 );
	}
);
