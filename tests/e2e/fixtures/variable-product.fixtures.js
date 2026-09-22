/**
 * `variableProduct` fixture — a variable product with 3 variations, one of
 * which deliberately omits its attribute value ("Any Size").
 *
 * That "Any"-valued variation exists to exercise
 * `VariationAttributeService::get_variation_selections()`
 * (includes/Services/VariationAttributeService.php) — bulk order add-to-cart
 * has to resolve it to a concrete value itself, since there is no attribute
 * picker in the table UI. See docs/e2e-testing-plan.md, Critical item 3.
 */
import { faker } from '@faker-js/faker';

import { WC_API_PATH } from '../utils/api.js';
import { test as base } from './fixtures.js';

export const test = base.extend( {
	variableProduct: async ( { restApi }, use ) => {
		const attributeName = `E2E Size ${ faker.string.alphanumeric( 4 ) }`;

		const productResponse = await restApi.post( `${ WC_API_PATH }/products`, {
			data: {
				name: `E2E Variable ${ faker.commerce.productName() } ${ faker.string.alphanumeric( 6 ) }`,
				type: 'variable',
				status: 'publish',
				attributes: [
					{
						name: attributeName,
						visible: true,
						variation: true,
						options: [ 'Small', 'Medium', 'Large' ],
					},
				],
			},
		} );
		const product = await productResponse.json();

		const variationsResponse = await restApi.post(
			`${ WC_API_PATH }/products/${ product.id }/variations/batch`,
			{
				data: {
					create: [
						{
							regular_price: '20.00',
							attributes: [ { name: attributeName, option: 'Small' } ],
						},
						{
							regular_price: '25.00',
							attributes: [ { name: attributeName, option: 'Medium' } ],
						},
						{
							// No `option` — the "Any Size" variation.
							regular_price: '30.00',
							attributes: [ { name: attributeName, option: '' } ],
						},
					],
				},
			}
		);
		const { create: variations } = await variationsResponse.json();

		await use( { product, variations, attributeName } );

		// Deleting the parent (force) also removes its variations
		// (WC_Product_Variable::delete()).
		await restApi.delete( `${ WC_API_PATH }/products/${ product.id }`, {
			data: { force: true },
		} );
	},
} );

export { expect, tags } from './fixtures.js';
