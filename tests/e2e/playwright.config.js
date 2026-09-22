import { defineConfig, devices } from '@playwright/test';

// Must match the "port" in .wp-env.json — the Docker WordPress instance
// wp-env spins up for this suite. Never point this at a real/live site.
const PORT = process.env.WP_ENV_PORT || 8886;
const BASE_URL = process.env.BASE_URL || `http://localhost:${ PORT }`;

// Outside CI, drive the system-installed Google Chrome instead of
// Playwright's bundled Chromium build: newer bundled builds drop support for
// older OS versions (e.g. macOS Monterey) ahead of local dev machines. CI
// installs Playwright's own Chromium (see .github/workflows/), so it keeps
// using the default there.
const CHROME_CHANNEL = process.env.CI ? {} : { channel: 'chrome' };

export default defineConfig( {
	globalSetup: './global-setup.js',

	// Safe now that every entity fixture (fixtures/*.fixtures.js) creates its
	// own randomized data over the REST API and cleans up after itself — no
	// spec shares mutable state with another. The one thing this does NOT
	// cover: a spec that changes a *global* setting (yay_bulk_order_settings,
	// a WooCommerce store-wide option, activating/deactivating a plugin).
	// Those must not assume they run alone — either restore the prior value
	// in an `afterEach`/`afterAll`, or force them to run un-parallelized via
	// `test.describe.configure({ mode: 'serial' })` in that spec file, the
	// way WooCommerce's own e2e suite isolates its global-setting specs
	// (see docs/e2e-testing-plan.md, section 1.5).
	fullyParallel: true,

	// Capped well below the CPU core count on purpose. wp-env's WordPress
	// container runs Apache with the `prefork` MPM (one process per request,
	// the heaviest MPM model) sharing a 6-core host with Playwright's own
	// Chromium workers — measured directly (`docker stats` during a live
	// failure): the container's CPU usage spiked to 171–283% (i.e. up to
	// ~2.8 cores) under the default 6 workers, and that contention is what
	// was causing intermittent timeouts (`waitForURL`, `socket hang up`),
	// not a logic bug. 6 workers failed ~50% of 20 real runs; 3 workers
	// passed 10/10 with no measurable slowdown (wall-clock time was the same
	// as a successful 6-worker run) — see docs/e2e-testing-plan.md.
	workers: 3,

	forbidOnly: !! process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: [ [ 'list' ], [ 'html', { outputFolder: 'playwright-report', open: 'never' } ] ],
	outputDir: 'test-results',

	use: {
		baseURL: BASE_URL,
		trace: 'retain-on-first-failure',
		screenshot: 'only-on-failure',
		video: 'retain-on-failure',
	},

	// Three projects instead of one shared testDir:
	//
	// - `compatibility` (tests/compatibility/) needs its own wp-env combo per
	//   run (see the `test:compat:<combo>` scripts in package.json) and is
	//   heavy enough (several `wp-env run cli` calls per test) to blow the
	//   default test timeout if it runs alongside `e2e`'s workers hammering
	//   the same Docker instance.
	//
	// - `hpos` (hpos-order-compatibility.spec.js alone) toggles WooCommerce's
	//   `custom_order_tables` feature — a WooCommerce CORE behavior (not
	//   this plugin's: it only ever calls the read-only
	//   `FeaturesUtil::declare_compatibility()`, see
	//   includes/YayBulkOrder.php) throws an UNCAUGHT exception, a hard PHP
	//   fatal error, when ANY order anywhere is "out of sync" at that exact
	//   moment — measured at ~10% of runs when it shared workers with
	//   checkout-from-bulk-order-table.spec.js (which creates a real order).
	//   A later/looser timeout or a retry only lowers that probability, it
	//   doesn't remove the race, so this test gets excluded from `e2e` and
	//   run in its own project instead. `workers: 1` only bounds this
	//   project's own (single) test; the real guarantee against overlapping
	//   `e2e` is the `test`/`test:ui` scripts below running `e2e` and `hpos`
	//   as two SEPARATE, sequential `playwright test` invocations — Playwright
	//   gives no cross-project ordering guarantee within one invocation, even
	//   with `workers: 1` on one side, so splitting the process is the only
	//   airtight way to guarantee zero temporal overlap.
	//
	// `pnpm test`/`test:ui` run `e2e` then `hpos`; `test:compat:*` runs only
	// `compatibility`.
	projects: [
		{
			name: 'e2e',
			testDir: './tests',
			testIgnore: [ '**/compatibility/**', '**/hpos-order-compatibility.spec.js' ],
			use: { ...devices[ 'Desktop Chrome' ], ...CHROME_CHANNEL },
		},
		{
			name: 'hpos',
			testDir: './tests/merchant',
			testMatch: 'hpos-order-compatibility.spec.js',
			workers: 1,
			use: { ...devices[ 'Desktop Chrome' ], ...CHROME_CHANNEL },
		},
		{
			name: 'compatibility',
			testDir: './tests/compatibility',
			// `workers: 1`: at >1, concurrent `wp-env run cli` calls race on
			// `@wordpress/env`'s own unsynchronized wp-env-cache.json
			// read-modify-write — a bug in that package, not here — and can
			// corrupt it into invalid JSON, which every wp-env command then
			// misreads as "Environment not initialized". Reproduced and
			// documented in detail in docs/e2e-testing-plan.md, section 8.
			workers: 1,
			use: { ...devices[ 'Desktop Chrome' ], ...CHROME_CHANNEL },
		},
	],
} );
