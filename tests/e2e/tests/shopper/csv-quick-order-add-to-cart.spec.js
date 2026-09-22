/**
 * Important (Pro): uploading a CSV of "SKU,quantity" rows through the Quick
 * Order form adds each matching product to the cart with that quantity.
 *
 * Exercises CSVOrderService::quick_csv_add_to_cart()
 * (includes/Pro/Services/CSVOrderService.php) — a classic form POST against
 * the WooCommerce session cart, not the Store API. See
 * docs/e2e-testing-plan.md, Important item 9.
 *
 * Single test in this file: it flips the global `csvOrder.isAddToAccountPage`
 * setting on (see below) — same parallel-safety reasoning as the
 * `codPaymentGateway` fixture.
 */
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { expect, tags, test } from '../../fixtures/index.js';
import { CsvOrderPage } from '../../utils/csv-order.page.js';
import { logIn } from '../../utils/login.js';
import { admin } from '../../utils/test-data.js';

test(
	'a CSV of SKU,quantity rows adds the matching product to the cart',
	{ tag: tags.REGRESSION },
	async ( { page, product, restApi }, testInfo ) => {
		const csvPath = path.join(
			os.tmpdir(),
			`ybo-quick-order-${ testInfo.testId }.csv`
		);
		await fs.writeFile( csvPath, `SKU,Quantity\n${ product.sku },3\n` );

		// "Quick Order" only appears in My Account (menu + endpoint content)
		// when this setting is on — it defaults to `false`
		// (SettingsService::get_default_settings()). This mutates a global
		// setting; restored at the end, and no other spec depends on it.
		const settingsBefore = await (
			await restApi.get( '/wp-json/yay-bulk-order/v1/settings' )
		).json();
		await restApi.post( '/wp-json/yay-bulk-order/v1/settings', {
			data: { csvOrder: { isAddToAccountPage: true } },
		} );

		await logIn( page, admin.username, admin.password );

		const csvOrderPage = new CsvOrderPage( page );
		await csvOrderPage.goto();
		await csvOrderPage.uploadAndSubmit( csvPath );

		await expect( csvOrderPage.resultsLog ).toContainText(
			'Added 1 product(s) to cart.'
		);

		const cart = await csvOrderPage.getCart();
		const cartItem = cart.items.find( ( item ) => item.id === product.id );
		expect( cartItem?.quantity ).toBe( 3 );

		await fs.unlink( csvPath );
		await restApi.post( '/wp-json/yay-bulk-order/v1/settings', {
			data: settingsBefore,
		} );
	}
);
