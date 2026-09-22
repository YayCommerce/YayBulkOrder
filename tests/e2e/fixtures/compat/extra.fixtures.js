/**
 * `extraOptionSetFactory` — creates a YayExtra "Option Set" (its own custom
 * post type, `yaye_option_set`) with a single REQUIRED text field, scoped
 * to one product, for
 * tests/compatibility/yayextra-required-extra-option.spec.js.
 *
 * YayExtra has no REST API and no `show_ui`/public admin screen for this
 * CPT (includes/Init/CustomPostType.php registers it with `show_ui: false`,
 * `publicly_queryable: false`) — its own admin UI writes to it entirely
 * through internal Ajax handlers. The only way to create one without
 * clicking through that UI is to call the plugin's own
 * `CustomPostType::create_option_set_from_data()` directly via `wp eval`,
 * which is what its Ajax handler itself calls
 * (includes/Init/Ajax.php) — same code path, no UI.
 *
 * Field shape (`options[].type`, `isRequired`, …) matches what
 * includes/Classes/ProductPage.php and includes/Templates/text_field.php
 * read — see docs/e2e-testing-plan.md section 4 for why this specific
 * shape (a required 'text' field) is enough to test the silent-bypass
 * finding: validate_option_fields() gates ALL of its required-field checks
 * behind `$_POST['yaye_visibility_option_list']` being non-empty, so the
 * field type never actually matters for that finding.
 */
import { wpCLI } from '../../utils/cli.js';
import { test as base } from '../fixtures.js';

export const test = base.extend( {
	extraOptionSetFactory: async ( {}, use ) => {
		const createdOptionSetIds = [];

		await use( {
			/**
			 * @param {object} params
			 * @param {number} params.productId Product this option set applies to.
			 * @param {string} [params.fieldName] Label shown for the required field.
			 * @return {Promise<number>} The new `yaye_option_set` post ID.
			 */
			create: async ( { productId, fieldName = 'E2E Required Note' } ) => {
				const data = {
					name: 'E2E Required Option Set',
					description: '',
					status: 1,
					options: [
						{
							id: 'e2e_required_text',
							name: fieldName,
							type: { label: 'Text', value: 'text' },
							isRequired: true,
						},
					],
					actions: [],
					products: {
						product_filter_type: 1, // choose product one by one.
						product_filter_one_by_one: [ productId ],
						// Read (buggily) via `!empty(...)` regardless of filter
						// type by ProductPage::get_product_applies() — must stay
						// non-empty for `product_filter_one_by_one` to be used.
						product_filter_by_conditions: {
							match_type: { label: 'Any', value: 'any' },
							conditions: [],
						},
					},
					custom_css: '',
				};

				const { stdout } = await wpCLI( [
					'eval',
					`echo \\YayExtra\\Init\\CustomPostType::create_option_set_from_data( json_decode( ${ JSON.stringify(
						JSON.stringify( data )
					) }, true ) );`,
				] );
				const optionSetId = Number( stdout.trim() );
				createdOptionSetIds.push( optionSetId );
				return optionSetId;
			},
		} );

		for ( const optionSetId of createdOptionSetIds ) {
			await wpCLI( [ 'post', 'delete', String( optionSetId ), '--force' ] );
		}
	},
} );

export { expect, tags } from '../fixtures.js';
