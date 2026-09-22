/**
 * Important: a table configured to query "by category" (`queryBy:
 * 'by-categories'`, see ProductTablesService::QUERY_BY_OPTIONS) only shows
 * products in that category.
 *
 * See docs/e2e-testing-plan.md, Important item 10. This test caught a real
 * bug on first run: ProductTableShortcode::operate_shortcode_attrs() passed
 * the admin's 'by-categories' value straight through to the query engine,
 * which only recognizes the singular 'by-category' (ProductQueryService /
 * the block editor's query-types.ts) — so the category restriction was
 * silently dropped and every product showed up. Fixed by translating the
 * value in ProductTableShortcode.php instead of renaming either side, since
 * both spellings are the real, currently-shipped convention of their own
 * layer (admin Table Builder vs. block editor / query engine).
 */
import { expect, tags, test } from '../../fixtures/index.js';
import { ProductTablePage } from '../../utils/product-table.page.js';

test(
	'a table scoped to a category only shows products in that category',
	{ tag: tags.REGRESSION },
	async ( {
		page,
		productFactory,
		categoryFactory,
		bulkOrderTableFactory,
		wpPageFactory,
	} ) => {
		const category = await categoryFactory.create();
		const productInCategory = await productFactory.create( {
			categories: [ { id: category.id } ],
		} );

		const table = await bulkOrderTableFactory.create( {
			query: {
				queryBy: 'by-categories',
				categories: [ category.id ],
				products: [],
			},
		} );

		const tablePage = new ProductTablePage( page );
		await tablePage.goto( wpPageFactory, table.id );

		await expect( tablePage.row( productInCategory.id ) ).toBeVisible();
		await expect( page.locator( 'tr[data-wp-key]' ) ).toHaveCount( 1 );
	}
);
