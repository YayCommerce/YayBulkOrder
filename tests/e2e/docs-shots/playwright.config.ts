import path from 'path';
import { defineConfig } from '@playwright/test';

// Docs screenshots (`pnpm docs:shots`), on their own site (docs-shots/.wp-env.json,
// port 8891), so the demo data never mixes with the e2e data. run.sh starts and
// seeds that site, then runs this config.

// DOCS_SHOTS="table-builder-columns quick-order-upload": those shots only; empty runs all.
const only = (process.env.DOCS_SHOTS ?? '').split(/[\s,]+/).filter(Boolean);
const bad = only.find((name) => !/^[a-z0-9-]+$/.test(name));
if (bad) throw new Error(`DOCS_SHOTS: "${bad}" is not a shot name`);

export default defineConfig({
  testDir: __dirname,
  testMatch: 'shots.spec.ts',
  outputDir: path.join(__dirname, 'test-results'),
  timeout: 120_000,
  workers: 1,
  // A shot name in a test's title tags it: run every test that takes one of the names given.
  grep: only.length ? new RegExp(only.map((name) => `\\b${name}\\b`).join('|')) : undefined,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:8891',
    channel: process.env.CI ? undefined : 'chrome',
    // 1100 wide: a full-width part (Brandy's content, a table) fits the docs' widest image.
    viewport: { width: 1100, height: 860 },
    deviceScaleFactor: 2,
    locale: 'en-US',
    permissions: ['clipboard-read', 'clipboard-write'],
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
});
