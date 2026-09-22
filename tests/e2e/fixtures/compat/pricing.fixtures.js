/**
 * `pricingRule` — a YayPricing "product pricing" rule (a flat percentage
 * off every product), for the price-stacking compatibility test.
 *
 * YayPricing has no REST endpoint for writing a single rule (only a
 * "matching products preview" route, `yaydp/v1/rule/matching-products`,
 * and a generic "save whole settings page" route that expects a custom
 * nonce this suite has no easy way to mint) — like Yay Wholesale B2B, rules
 * are a plain option array (`yaydp_product_pricing_rules`, read by
 * yaydp_get_product_pricing_rules() in the plugin's own source). The shape
 * below was derived from reading the rule engine directly — see
 * includes/abstracts/abstract-yaydp-rule.php (is_running, pricing.type/value)
 * and includes/helper/class-yaydp-helper.php (`all_product` filter type
 * matches every product without needing a specific filter list) in the
 * downloaded plugin. This is inherently more fragile than a documented API:
 * if a future YayPricing version changes this schema, this fixture (not
 * YayBulkOrder) is what breaks — see docs/e2e-testing-plan.md.
 *
 * Setup/teardown each do ONE `wp eval` call (data passed in as a JSON
 * string literal, decoded PHP-side) — see the wholesale fixture's own
 * comment for why.
 */
import { wpCLI } from '../../utils/cli.js';
import { test as base } from '../fixtures.js';

const RULES_OPTION = 'yaydp_product_pricing_rules';

export const test = base.extend( {
	/** A rule discounting every product by 10%, active for the duration of the test. */
	pricingRule: async ( {}, use, testInfo ) => {
		const ruleId = `e2e-rule-${ testInfo.workerIndex }-${ Date.now() }`;
		const rule = {
			id: ruleId,
			rule_id: ruleId,
			name: 'E2E 10% off all products',
			type: 'simple_adjustment',
			is_enabled: true,
			buy_products: {
				match_type: 'any',
				filters: [ { type: 'all_product' } ],
			},
			pricing: {
				type: 'percentage_discount',
				value: 10,
				maximum_value: null,
			},
			conditions: { match_type: 'any', logics: [] },
			schedule: { enable: false },
			schedule_recurring: { type: '' },
			maximum_uses: { enable: false, value: 0 },
			use_time: 0,
		};

		const { stdout } = await wpCLI( [
			'eval',
			`
			$existing = get_option( ${ JSON.stringify( RULES_OPTION ) }, [] );
			echo wp_json_encode( $existing );
			$rule = json_decode( ${ JSON.stringify( JSON.stringify( rule ) ) }, true );
			update_option( ${ JSON.stringify( RULES_OPTION ) }, array_merge( $existing, [ $rule ] ) );
			`,
		] );
		const existingRules = JSON.parse( stdout.trim() );

		await use( rule );

		await wpCLI( [
			'eval',
			`update_option( ${ JSON.stringify( RULES_OPTION ) }, json_decode( ${ JSON.stringify( JSON.stringify( existingRules ) ) }, true ) );`,
		] );
	},
} );

export { expect, tags } from '../fixtures.js';
