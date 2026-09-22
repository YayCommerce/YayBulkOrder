/**
 * Page Object for the Pro "Quick Order via CSV Upload" form
 * (apps/blocks-pro/src/quick-csv-order/render.php), reached at the
 * `ybo-quick-order` My Account endpoint. A classic (non-Store-API) form
 * POST handled by CSVOrder::handle_add_to_cart() /
 * CSVOrderService::quick_csv_add_to_cart().
 */
export class CsvOrderPage {
	/** @param {import('@playwright/test').Page} page */
	constructor( page ) {
		this.page = page;
	}

	async goto() {
		await this.page.goto( '/my-account/ybo-quick-order/' );
	}

	get fileInput() {
		return this.page.locator( 'input[name="ybo_csv_order"]' );
	}

	get submitButton() {
		return this.page.getByRole( 'button', { name: 'Add to Cart' } );
	}

	/** @param {string} csvFilePath Absolute path to a local .csv file. */
	async uploadAndSubmit( csvFilePath ) {
		await this.fileInput.setInputFiles( csvFilePath );
		await this.submitButton.click();
		await this.page.waitForLoadState( 'load' );
	}

	get resultsLog() {
		return this.page.locator( '.ybo_csv_order_logs' );
	}

	async getCart() {
		const response = await this.page.request.get(
			'/wp-json/wc/store/v1/cart'
		);
		return response.json();
	}
}
