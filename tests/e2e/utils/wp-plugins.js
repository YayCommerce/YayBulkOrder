/**
 * Lets a compatibility spec check which Yay plugin(s) are actually active
 * in the wp-env combo it's currently running against, so the SAME
 * `tests/compatibility/` suite can run unmodified across every
 * `.wp-env.<combo>.json` (see docs/e2e-testing-plan.md, Phase 4) — a spec
 * that needs a plugin the current combo doesn't install calls
 * `test.skip()` instead of failing for an unrelated reason.
 */
import { wpCLI } from './cli.js';

/** @param {string} slug Plugin folder/file slug, as `wp plugin list` reports it. */
export async function isPluginActive( slug ) {
	try {
		const { stdout } = await wpCLI( [
			'plugin',
			'list',
			'--status=active',
			'--field=name',
		] );
		return stdout
			.split( '\n' )
			.map( ( line ) => line.trim() )
			.includes( slug );
	} catch {
		return false;
	}
}
