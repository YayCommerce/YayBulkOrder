/**
 * `wholesaleCustomer` — a WordPress user with a Yay Wholesale B2B role
 * attached, for the price-stacking compatibility test
 * (tests/compatibility/price-stacking-wholesale-and-pricing.spec.js).
 *
 * Yay Wholesale B2B has no REST API for its roles; they're a plain option
 * array (`yaywholesaleb2b_roles`, read by
 * includes/Helpers/RolesHelper.php::get_wholesale_roles() in the plugin's
 * own source) plus a real WP role each customer is assigned to
 * (RolesHelper::generate_default_role() does the same two steps: `add_role`
 * then save the roles option — mirrored here via WP-CLI instead of the
 * admin UI). Schema fields (discount, applyToSalePrice, status, slug) match
 * what YayBulkOrder's own compat adapter reads
 * (includes/Engines/Compatibles/YayWholesale.php).
 *
 * Each fixture below does its setup in ONE `wp eval` call (data passed in
 * as a JSON string literal, decoded PHP-side) rather than several separate
 * `wp-env run cli` invocations — every spawn costs a couple of seconds, and
 * specs using both this and the pricing fixture already raise their test
 * timeout to cover the combined Docker-exec cost.
 */
import { wpCLI } from '../../utils/cli.js';
import { test as base } from '../fixtures.js';

const ROLES_OPTION = 'yaywholesaleb2b_roles';

/** A JS value, safely embedded as a PHP `json_decode( '...', true )` expression. */
function phpFromJSON( value ) {
	return `json_decode( ${ JSON.stringify( JSON.stringify( value ) ) }, true )`;
}

export const test = base.extend( {
	wholesaleRole: async ( {}, use, testInfo ) => {
		const slug = `e2e_wholesale_${ testInfo.workerIndex }_${ Date.now() }`;
		const roleConfig = {
			id: Date.now(),
			name: 'E2E Wholesale Role',
			description: 'Created by the compatibility test suite.',
			discount: 20,
			minOrderQuantity: 0,
			minOrderAmount: 0,
			applyToSalePrice: false,
			status: true,
			slug,
		};

		const { stdout } = await wpCLI( [
			'eval',
			`
			add_role( ${ JSON.stringify( slug ) }, 'E2E Wholesale Role', [ 'read' => true ] );
			$existing = get_option( ${ JSON.stringify( ROLES_OPTION ) }, [] );
			echo wp_json_encode( $existing );
			update_option( ${ JSON.stringify( ROLES_OPTION ) }, array_merge( $existing, [ ${ phpFromJSON( roleConfig ) } ] ) );
			`,
		] );
		const existingRoles = JSON.parse( stdout.trim() );

		await use( roleConfig );

		await wpCLI( [
			'eval',
			`
			update_option( ${ JSON.stringify( ROLES_OPTION ) }, ${ phpFromJSON( existingRoles ) } );
			remove_role( ${ JSON.stringify( slug ) } );
			`,
		] );
	},

	wholesaleCustomer: async ( { wholesaleRole }, use, testInfo ) => {
		const suffix = `${ testInfo.workerIndex }_${ Date.now() }`;
		const username = `e2e_wholesale_user_${ suffix }`;
		const password = 'Password!123';
		const email = `${ username }@example.com`;

		const { stdout: userId } = await wpCLI( [
			'user',
			'create',
			username,
			email,
			`--role=${ wholesaleRole.slug }`,
			`--user_pass=${ password }`,
			'--porcelain',
		] );

		await use( {
			id: Number( userId.trim() ),
			username,
			email,
			password,
			role: wholesaleRole,
		} );

		await wpCLI( [ 'user', 'delete', username, '--yes' ] );
	},
} );

export { expect, tags } from '../fixtures.js';
