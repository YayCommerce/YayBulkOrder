/**
 * Single import point for compatibility specs (tests/compatibility/):
 *
 *   import { test, expect, tags } from '../../fixtures/compat/index.js';
 *
 * Kept separate from fixtures/index.js on purpose — these fixtures
 * configure third-party Yay plugins that are NOT installed in the regular
 * dev environment (.wp-env.json) or in the plain Phase 2/3 test run, only
 * in the Phase 4 `.wp-env.<combo>.json` environments. Merging them into the
 * main fixtures/index.js would make every Phase 3 spec silently depend on
 * plugins most local/CI runs don't have.
 */
import { mergeTests } from '@playwright/test';

import { test as bulkOrderTableTest } from '../bulk-order-table.fixtures.js';
import { test as productTest } from '../product.fixtures.js';
import { test as variableProductTest } from '../variable-product.fixtures.js';
import { test as wpPageTest } from '../wp-page.fixtures.js';
import { test as currencyTest } from './currency.fixtures.js';
import { test as extraTest } from './extra.fixtures.js';
import { test as pricingTest } from './pricing.fixtures.js';
import { test as wholesaleTest } from './wholesale.fixtures.js';

export const test = mergeTests(
	productTest,
	variableProductTest,
	bulkOrderTableTest,
	wpPageTest,
	wholesaleTest,
	pricingTest,
	currencyTest,
	extraTest
);

export { expect, tags } from '../fixtures.js';
