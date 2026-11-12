import path from 'path';
import { defineConfig, devices } from '@playwright/test';

// Must match the "port" in .wp-env.json — the Docker WordPress instance
// wp-env spins up for this suite. Never point this at a real/live site.
const PORT = process.env.WP_ENV_PORT ?? 8890;
export const BASE_URL = process.env.BASE_URL ?? `http://localhost:${PORT}`;
const { CI } = process.env;

// Outside CI, drive the system-installed Google Chrome instead of
// Playwright's bundled Chromium build: newer bundled builds (and their
// ffmpeg helper, needed for video recording) drop support for older macOS
// versions (e.g. Monterey) ahead of local dev machines. CI installs
// Playwright's own Chromium + ffmpeg, so it keeps using the defaults there.
const CHROME_CHANNEL = CI ? {} : { channel: 'chrome' as const };

// Recording mode (`pnpm test:e2e:record`): a video of every test, slowed down
// (RECORD_DELAY ms per action, default 800), with step captions, click marks and
// a pause after each step (utils/journey.ts), indexed in videos/index.html.
// Otherwise no video locally, and video on failure only in CI.
const RECORD = !!process.env.RECORD && process.env.RECORD !== '0';
const RECORD_DELAY = Number(process.env.RECORD_DELAY ?? 800);
const VIDEO = RECORD
  ? { mode: 'on' as const, size: { width: 1280, height: 720 } }
  : CI
    ? ('retain-on-failure' as const)
    : ('off' as const);

export const ADMIN_STATE_PATH = path.join(__dirname, '.state', 'admin.json');

const sharedUse = {
  baseURL: BASE_URL,
  trace: 'retain-on-first-failure' as const,
  // Keep a screenshot at the end of every test, passed or failed.
  screenshot: 'on' as const,
  video: VIDEO,
  ...devices['Desktop Chrome'],
  ...CHROME_CHANNEL,
  launchOptions: RECORD ? { slowMo: RECORD_DELAY } : {},
};

export default defineConfig({
  // The pauses in recording mode make every test several times longer.
  timeout: RECORD ? 300_000 : 60_000,
  expect: { timeout: CI ? 15_000 : 8_000 },
  retries: CI ? 1 : 0,
  workers: 1,
  forbidOnly: !!CI,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
    ...(RECORD ? [['./utils/video-index.ts'] as [string]] : []),
  ],
  outputDir: 'test-results',
  use: sharedUse,

  projects: [
    // Logs in once and saves the session; only the "admin" project depends
    // on it, so guest/storefront specs never pay for a login.
    {
      name: 'setup',
      testDir: './fixtures',
      testMatch: '**/auth.setup.ts',
    },
    // Storefront/guest specs — anything NOT named `*.admin.spec.ts`.
    {
      name: 'guest',
      testDir: './tests',
      testIgnore: '**/*.admin.spec.ts',
    },
    // wp-admin specs — name the file `<feature>.admin.spec.ts` to land here.
    {
      name: 'admin',
      testDir: './tests',
      testMatch: '**/*.admin.spec.ts',
      dependencies: ['setup'],
      // Clipboard access for the "Copy as Blocks / Shortcode" then paste tests.
      use: { storageState: ADMIN_STATE_PATH, permissions: ['clipboard-read', 'clipboard-write'] },
    },
  ],
});
