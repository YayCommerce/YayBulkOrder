/**
 * Important: the table's search box narrows the product list to matches,
 * and shows the empty state when nothing matches.
 *
 * See docs/e2e-testing-plan.md, Important item 10.
 */
import { faker } from '@faker-js/faker';

import { expect, tags, test } from '../../fixtures/index.js';
import { ProductTablePage } from '../../utils/product-table.page.js';

test(
	'typing a matching keyword narrows the table to that product',
	{ tag: tags.REGRESSION },
	async ( { page, productFactory, bulkOrderTableFactory, wpPageFactory } ) => {
		const uniqueWord = `Uniq${ faker.string.alphanumeric( 10 ) }`;
		const matchingProduct = await productFactory.create( {
			name: `${ uniqueWord } Widget`,
		} );

		const table = await bulkOrderTableFactory.create( {
			features: {
				hasFilter: true,
				hasSearch: true,
				hasPagination: false,
				pageSize: 5,
			},
		} );

		const tablePage = new ProductTablePage( page );
		await tablePage.goto( wpPageFactory, table.id );
		await tablePage.search( uniqueWord );

		await expect( tablePage.row( matchingProduct.id ) ).toBeVisible();
		await expect( page.locator( 'tr[data-wp-key]' ) ).toHaveCount( 1 );
	}
);

test(
	'a keyword matching nothing shows the empty state',
	{ tag: tags.REGRESSION },
	async ( { page, bulkOrderTableFactory, wpPageFactory } ) => {
		// `bulkOrderTable`'s default config has `hasSearch: false` (no search
		// box at all) — this needs one explicitly enabled.
		const table = await bulkOrderTableFactory.create( {
			features: {
				hasFilter: true,
				hasSearch: true,
				hasPagination: false,
				pageSize: 5,
			},
		} );

		const tablePage = new ProductTablePage( page );
		await tablePage.goto( wpPageFactory, table.id );
		await tablePage.search( `nonexistent-${ Date.now() }` );

		await expect( tablePage.emptyStateMessage ).toBeVisible();
	}
);
