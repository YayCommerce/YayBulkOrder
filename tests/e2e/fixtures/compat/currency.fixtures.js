/**
 * `secondaryCurrency` — a YayCurrency currency with a fixed, known exchange
 * rate, for the currency-conversion compatibility test.
 *
 * YayCurrency stores each currency as a `yay-currency-manage` custom post
 * (`show_in_rest: true`, but this plugin doesn't ship a `wc/v3`-style REST
 * client for it, so WP-CLI is simpler here too) with the exchange rate and
 * formatting as post meta — see
 * includes/Helpers/Helper.php::update_post_meta_currency() in the
 * downloaded plugin for the exact meta keys used below. `rate_type:
 * 'manual'` keeps the rate exactly what this fixture sets — YayCurrency
 * only overwrites it on an explicit refresh action, never implicitly.
 *
 * Which currency is active for the current visitor is a cookie
 * (`yay_currency_widget`, valued with the currency post ID) — the spec
 * sets it via `context.addCookies()` before navigating.
 *
 * Sets the post + every meta key in ONE `wp eval` call (data passed in as a
 * JSON string literal, decoded PHP-side) rather than a dozen separate
 * `wp post meta update` invocations — each `wp-env run cli` spawn costs a
 * couple of seconds, and this compat fixture already has to share a test
 * timeout with other Docker-exec-heavy setup (see the spec that uses it,
 * which raises its `timeout`).
 */
import { wpCLI } from '../../utils/cli.js';
import { test as base } from '../fixtures.js';

export const test = base.extend( {
	/** A EUR currency at a fixed 0.5x rate (i.e. half the store's base-currency price). */
	secondaryCurrency: async ( {}, use ) => {
		const meta = {
			currency_position: 'left',
			currency_code_position: 'not_display',
			thousand_separator: ',',
			decimal_separator: '.',
			number_decimal: 2,
			rounding_type: 'disabled',
			rounding_value: 1,
			subtract_amount: 0,
			rate: 0.5,
			rate_type: 'manual',
			fee: { value: '0', type: 'fixed' },
		};

		const { stdout } = await wpCLI( [
			'eval',
			`
			$id = wp_insert_post( [
				'post_type'   => 'yay-currency-manage',
				'post_title'  => 'EUR',
				'post_status' => 'publish',
			] );
			$meta = json_decode( ${ JSON.stringify( JSON.stringify( meta ) ) }, true );
			foreach ( $meta as $key => $value ) {
				update_post_meta( $id, $key, $value );
			}
			echo $id;
			`,
		] );
		const currencyId = Number( stdout.trim() );

		await use( { id: currencyId, code: 'EUR', rate: 0.5, symbol: '€' } );

		await wpCLI( [ 'post', 'delete', String( currencyId ), '--force' ] );
	},
} );

export { expect, tags } from '../fixtures.js';
