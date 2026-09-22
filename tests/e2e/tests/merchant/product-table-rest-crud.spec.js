/**
 * Important: the plugin's own REST namespace for Product Table prebuilds
 * (`yay-bulk-order/v1/product-tables`) supports full CRUD, bulk-delete, and
 * requires `manage_woocommerce` — verified directly over REST, no admin UI.
 *
 * See docs/e2e-testing-plan.md, Important item 6.
 */
import { expect, tags, test } from '../../fixtures/index.js';
import { createRestApiContext, YBO_API_PATH } from '../../utils/api.js';

test(
	'creates, reads and updates a table',
	{ tag: tags.REGRESSION },
	async ( { restApi, bulkOrderTableFactory } ) => {
		const table = await bulkOrderTableFactory.create( {
			title: 'CRUD Test Table',
		} );
		expect( table.title ).toBe( 'CRUD Test Table' );

		const fetched = await (
			await restApi.get( `${ YBO_API_PATH }/product-tables/${ table.id }` )
		).json();
		expect( fetched.id ).toBe( table.id );

		const updateResponse = await restApi.put(
			`${ YBO_API_PATH }/product-tables/${ table.id }`,
			{
				data: {
					title: 'Updated Title',
					query: table.query,
					columns: table.columns,
					features: table.features,
				},
			}
		);
		expect( updateResponse.ok() ).toBeTruthy();
		expect( ( await updateResponse.json() ).title ).toBe( 'Updated Title' );
	}
);

test(
	'bulk-delete removes multiple tables at once',
	{ tag: tags.REGRESSION },
	async ( { restApi, bulkOrderTableFactory } ) => {
		const tableA = await bulkOrderTableFactory.create();
		const tableB = await bulkOrderTableFactory.create();

		const response = await restApi.delete(
			`${ YBO_API_PATH }/product-tables/bulk-delete`,
			{ data: { tableIds: [ tableA.id, tableB.id ] } }
		);
		expect( response.ok() ).toBeTruthy();
		expect( await response.json() ).toBe( 2 );

		const getDeleted = await restApi.get(
			`${ YBO_API_PATH }/product-tables/${ tableA.id }`
		);
		expect( getDeleted.status() ).toBe( 400 );
	}
);

test(
	'a user without manage_woocommerce cannot manage tables',
	{ tag: tags.REGRESSION },
	async ( { baseURL, customer, bulkOrderTable } ) => {
		const customerApi = await createRestApiContext( baseURL, {
			username: customer.email,
			password: 'Password!123',
		} );

		const listResponse = await customerApi.get(
			`${ YBO_API_PATH }/product-tables`
		);
		expect( listResponse.status() ).toBe( 403 );

		const createResponse = await customerApi.post(
			`${ YBO_API_PATH }/product-tables`,
			{ data: { title: 'Should be forbidden' } }
		);
		expect( createResponse.status() ).toBe( 403 );

		const deleteResponse = await customerApi.delete(
			`${ YBO_API_PATH }/product-tables/${ bulkOrderTable.id }`
		);
		expect( deleteResponse.status() ).toBe( 403 );

		await customerApi.dispose();
	}
);
