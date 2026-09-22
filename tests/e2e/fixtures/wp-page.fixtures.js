/**
 * `wpPageFactory` — publishes a plain WordPress page with arbitrary content
 * (typically a shortcode, e.g. `[ybo-product-table id="123"]`), used to put
 * a bulk order table or CSV order form on the storefront without touching
 * the block editor UI.
 */
import { WP_API_PATH } from '../utils/api.js';
import { test as base } from './fixtures.js';

export const test = base.extend( {
	wpPageFactory: async ( { restApi }, use ) => {
		const createdPageIds = [];

		await use( {
			/** @param {{ title?: string, content: string }} params */
			create: async ( { title = 'E2E Page', content } ) => {
				const response = await restApi.post( `${ WP_API_PATH }/pages`, {
					data: { title, status: 'publish', content },
				} );
				const page = await response.json();
				createdPageIds.push( page.id );
				return page;
			},
		} );

		for ( const pageId of createdPageIds ) {
			await restApi.delete( `${ WP_API_PATH }/pages/${ pageId }`, {
				data: { force: true },
			} );
		}
	},
} );

export { expect, tags } from './fixtures.js';
