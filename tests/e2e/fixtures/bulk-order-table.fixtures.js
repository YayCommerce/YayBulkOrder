/**
 * Fixtures for the plugin's own entity: the "Product Table" prebuild
 * (`ybo_product_table`, see includes/Services/ProductTablesService.php),
 * set up through the plugin's own REST namespace
 * (`yay-bulk-order/v1/product-tables`) — never through the admin table
 * builder UI.
 *
 * `bulkOrderTableFactory` is the primitive (arbitrary `query`/`columns`/
 * `features` overrides, e.g. to pin `query.products` to a specific fixture
 * product for a pricing assertion); `bulkOrderTable` is the common case —
 * one table over "all products" — built on top of it.
 */
import { faker } from '@faker-js/faker';

import { YBO_API_PATH } from '../utils/api.js';
import { test as base } from './fixtures.js';

/**
 * Every column enabled by default — an empty `columns` array (this plugin's
 * own PHP-side default, see ProductTablesService::default_config()) renders
 * NO columns at all, which would make a freshly created table useless for
 * any UI test that then has to interact with it.
 *
 * Deliberately excludes "select": the shortcode template
 * (includes/Engines/Shortcodes/templates/parts/product-table.php) appends
 * `yay-bulk-order/product-table-column-select` UNCONDITIONALLY after the
 * configured columns, regardless of what `columns` contains — listing it
 * here too would render two checkboxes in the same row.
 */
function defaultColumns() {
	return [ 'product', 'sku', 'quantity', 'subtotal', 'add-to-cart' ].map(
		( slug ) => ( { slug, enabled: true, heading: '', responsive: 'always-show' } )
	);
}

function defaultTablePayload( overrides = {} ) {
	return {
		title: `E2E Bulk Order Table ${ faker.string.alphanumeric( 6 ) }`,
		query: {
			queryBy: 'all-products',
			categories: [],
			products: [],
		},
		columns: defaultColumns(),
		features: {
			hasFilter: false,
			hasSearch: false,
			hasPagination: false,
			pageSize: 5,
		},
		...overrides,
	};
}

export const test = base.extend( {
	bulkOrderTableFactory: async ( { restApi }, use ) => {
		const createdTableIds = [];

		await use( {
			/** @param {object} [overrides] Merged over the table's default payload. */
			create: async ( overrides = {} ) => {
				const response = await restApi.post(
					`${ YBO_API_PATH }/product-tables`,
					{ data: defaultTablePayload( overrides ) }
				);
				const table = await response.json();
				createdTableIds.push( table.id );
				return table;
			},
		} );

		for ( const tableId of createdTableIds ) {
			await restApi.delete(
				`${ YBO_API_PATH }/product-tables/${ tableId }`
			);
		}
	},

	bulkOrderTable: async ( { bulkOrderTableFactory }, use ) => {
		await use( await bulkOrderTableFactory.create() );
	},
} );

export { expect, tags } from './fixtures.js';
