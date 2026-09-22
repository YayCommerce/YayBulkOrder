/**
 * Page Object for the storefront Product Table (bulk order table) rendered
 * by the `[ybo-product-table id="…"]` shortcode.
 *
 * Every selector here is taken from the block's own server-render templates
 * (apps/blocks/src/product-table/*\/render.php), not guessed — see
 * docs/e2e-testing-plan.md if any of these need re-deriving after a markup
 * change:
 *   - a row is `tr[data-wp-key="<productId>"]` (table-columns/render.php)
 *   - the add-to-cart control carries `data-product_id="<productId>"`
 *     (column-add-to-cart/render.php)
 *   - the quantity input is `.ybo-quantity-input` (column-quantity/render.php)
 *   - the row checkbox is `.ybo_purchase_list_item_actions`... N/A here,
 *     it's the bare `input[type=checkbox]` in column-select/render.php
 */
export class ProductTablePage {
	/** @param {import('@playwright/test').Page} page */
	constructor( page ) {
		this.page = page;
	}

	/**
	 * Publishes a page with the shortcode pointing at `table.id` and
	 * navigates to it.
	 *
	 * @param {{ create: Function }} wpPageFactory
	 * @param {number} tableId
	 */
	async goto( wpPageFactory, tableId ) {
		const wpPage = await wpPageFactory.create( {
			title: `E2E Product Table Page ${ tableId }`,
			content: `[ybo-product-table id="${ tableId }"]`,
		} );
		await this.page.goto( wpPage.link );
		return wpPage;
	}

	row( productId ) {
		return this.page.locator( `tr[data-wp-key="${ productId }"]` );
	}

	/** The add-to-cart control for a simple/variation row (a <button> for ajax-add-to-cart products, an <a> otherwise). */
	addToCartControl( productId ) {
		return this.row( productId ).locator( `[data-product_id="${ productId }"]` );
	}

	/** "View options" toggle shown on a variable product's parent row instead of a direct add-to-cart control. */
	viewOptionsButton( productId ) {
		return this.row( productId ).locator( '.ybo-view-options-button' );
	}

	async addToCart( productId ) {
		await this.addToCartControl( productId ).click();
	}

	quantityInput( productId ) {
		return this.row( productId ).locator( '.ybo-quantity-input' );
	}

	/** The Subtotal column cell (`data-wp-text="state.subtotalFormatted"`, column-subtotal/render.php). */
	subtotalCell( productId ) {
		return this.row( productId ).locator(
			'td[data-wp-text="state.subtotalFormatted"]'
		);
	}

	async setQuantity( productId, quantity ) {
		const input = this.quantityInput( productId );
		await input.fill( String( quantity ) );
		// The store reacts to the native `input` event; blur to commit it the
		// same way a real user tabbing away would.
		await input.blur();
	}

	selectCheckbox( productId ) {
		return this.row( productId ).locator( 'input[type="checkbox"]' );
	}

	async selectRow( productId ) {
		await this.selectCheckbox( productId ).check();
	}

	get bulkAddToCartButton() {
		return this.page.locator( '.ybo-bulk-action__submit' );
	}

	async addSelectedToCart() {
		await this.bulkAddToCartButton.click();
	}

	/** The small badge on the product thumbnail showing "already in cart" quantity. */
	cartQuantityBadge( productId ) {
		return this.row( productId ).locator( '.ybo-product-thumbnail__badge' );
	}

	get searchInput() {
		return this.page.locator( '.ybo-search__input' );
	}

	async search( term ) {
		await this.searchInput.fill( term );
	}

	get filterToggle() {
		return this.page.locator( '.ybo-filter-toggle' );
	}

	categoryLink( name ) {
		return this.page.locator( '.ybo-filter-sidebar__link', { hasText: name } );
	}

	async filterByCategory( name ) {
		await this.filterToggle.click();
		await this.categoryLink( name ).click();
	}

	paginationLink( pageNumber ) {
		return this.page.locator( '.ybo-pagination__link', {
			hasText: String( pageNumber ),
		} );
	}

	get emptyStateMessage() {
		return this.page.getByText( 'No products found' );
	}

	/**
	 * Reads the storefront's actual WooCommerce cart through the current
	 * browser session (shares cookies with `page`) — the authoritative,
	 * business-outcome way to assert what the UI action actually did,
	 * instead of trusting the UI's own optimistic state.
	 */
	async getCart() {
		const response = await this.page.request.get(
			'/wp-json/wc/store/v1/cart'
		);
		return response.json();
	}
}
