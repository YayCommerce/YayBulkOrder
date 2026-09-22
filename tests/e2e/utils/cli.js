/**
 * Runs WP-CLI commands inside the wp-env "cli" container.
 *
 * Mirrors the approach WooCommerce core uses in its own e2e suite
 * (tests/e2e/utils/cli.ts): shell out to `wp-env run cli`, preferring an
 * argument array (execFile) whenever the command carries dynamic values, so
 * nothing gets shell-interpolated.
 */
import { exec, execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify( exec );
const execFileAsync = promisify( execFile );

/**
 * @param {string|string[]} command WP-CLI subcommand and args, WITHOUT the
 *   leading `wp` (this wrapper adds it) — e.g. `'plugin list'` or
 *   `[ 'user', 'create', username, email ]`. Use the array form whenever any
 *   part of the command is a variable: `wp-env run cli` execs its argv
 *   directly (no shell), so an array is also what keeps a value containing
 *   spaces from being split into extra args.
 * @param {object} [options]
 * @param {string} [options.config] Path to a specific `.wp-env.*.json` file
 *   (relative to `tests/e2e/`), for the Phase 4 compatibility combos. Defaults
 *   to the `WP_ENV_CONFIG` environment variable (set by the `test:compat:*`
 *   scripts — see tests/e2e/package.json), so global-setup.js and every
 *   fixture automatically target whichever combo's wp-env Docker instance is
 *   actually running, with no call site changes. Omit both to use the
 *   default `.wp-env.json` wp-env auto-discovers in the cwd.
 * @return {Promise<{stdout: string, stderr: string}>}
 */
export async function wpCLI( command, options = {} ) {
	const config = options.config || process.env.WP_ENV_CONFIG;
	const configArgs = config ? [ '--config', config ] : [];

	if ( Array.isArray( command ) ) {
		return execFileAsync( 'pnpm', [
			'exec',
			'wp-env',
			...configArgs,
			'run',
			'cli',
			'--',
			'wp',
			...command,
		] );
	}

	const configFlag = config ? `--config ${ config }` : '';
	return execAsync(
		`pnpm exec wp-env ${ configFlag } run cli -- wp ${ command }`
	);
}
