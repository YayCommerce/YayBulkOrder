/**
 * Single import point for every fixture. Specs should do:
 *
 *   import { test, expect, tags } from '../../fixtures/index.js';
 *
 * and then request whichever entity fixtures they need
 * (`product`, `productFactory`, `variableProduct`, `customer`, `coupon`,
 * `categoryFactory`, `orderFactory`, `bulkOrderTable`,
 * `bulkOrderTableFactory`, `purchaseList`, `wpPageFactory`,
 * `codPaymentGateway`, `hposEnabled`) as normal Playwright fixture args —
 * Playwright only runs the setup/teardown for the ones a given test
 * actually destructures. `codPaymentGateway` and `hposEnabled` flip a
 * GLOBAL WooCommerce setting — see their own file comments for why a spec
 * using either must stay to exactly one test.
 */
import { mergeTests } from '@playwright/test';

import { test as bulkOrderTableTest } from './bulk-order-table.fixtures.js';
import { test as categoryTest } from './category.fixtures.js';
import { test as couponTest } from './coupon.fixtures.js';
import { test as customerTest } from './customer.fixtures.js';
import { test as hposTest } from './hpos.fixtures.js';
import { test as orderTest } from './order.fixtures.js';
import { test as paymentGatewayTest } from './payment-gateway.fixtures.js';
import { test as productTest } from './product.fixtures.js';
import { test as purchaseListTest } from './purchase-list.fixtures.js';
import { test as variableProductTest } from './variable-product.fixtures.js';
import { test as wpPageTest } from './wp-page.fixtures.js';

export const test = mergeTests(
	productTest,
	variableProductTest,
	customerTest,
	couponTest,
	categoryTest,
	orderTest,
	bulkOrderTableTest,
	purchaseListTest,
	wpPageTest,
	paymentGatewayTest,
	hposTest
);

export { expect, tags } from './fixtures.js';
