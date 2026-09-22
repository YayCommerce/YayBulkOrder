/**
 * Page Object for the Pro "Purchase List" My Account page
 * (apps/blocks-pro/src/purchase-list/render.php), reached at the
 * `ybo-purchase-list` My Account endpoint.
 */
export class PurchaseListPage {
	/** @param {import('@playwright/test').Page} page */
	constructor( page ) {
		this.page = page;
	}

	async goto() {
		await this.page.goto( '/my-account/ybo-purchase-list/' );
	}

	// The "View" and "Download" buttons both carry `data-purchase-list-id`
	// for the same list, so the id alone doesn't disambiguate — filter by
	// visible text too.
	viewButton( listId ) {
		return this.page.locator( `button[data-purchase-list-id="${ listId }"]`, {
			hasText: 'View',
		} );
	}

	async openList( listId ) {
		await this.viewButton( listId ).click();
	}

	get addToCartButton() {
		return this.page.getByRole( 'button', { name: 'Add to Cart' } );
	}

	async addListToCart( listId ) {
		await this.openList( listId );
		await this.addToCartButton.click();
	}

	async getCart() {
		const response = await this.page.request.get(
			'/wp-json/wc/store/v1/cart'
		);
		return response.json();
	}
}
