/**
 * Page Object for WooCommerce's block-based Checkout page (default page
 * created on WooCommerce activation, block content confirmed by inspecting
 * a real render — see docs/e2e-testing-plan.md).
 */
export class CheckoutPage {
	/** @param {import('@playwright/test').Page} page */
	constructor( page ) {
		this.page = page;
	}

	async goto() {
		await this.page.goto( '/checkout/' );
	}

	/**
	 * @param {object} details
	 * @param {string} details.email
	 * @param {string} details.firstName
	 * @param {string} details.lastName
	 * @param {string} details.address1
	 * @param {string} details.city
	 * @param {string} details.countryCode e.g. 'US'
	 * @param {string} [details.state] State/county select option value or label, if the country has one.
	 * @param {string} details.postcode
	 * @param {string} [details.phone]
	 */
	async fillBillingDetails( details ) {
		await this.page.locator( '#email' ).fill( details.email );
		await this.page.locator( '#billing-first_name' ).fill( details.firstName );
		await this.page.locator( '#billing-last_name' ).fill( details.lastName );
		await this.page.locator( '#billing-address_1' ).fill( details.address1 );
		await this.page.locator( '#billing-city' ).fill( details.city );
		await this.page
			.locator( '#billing-country' )
			.selectOption( details.countryCode );
		if ( details.state ) {
			const stateField = this.page.locator( '#billing-state' );
			// A US-style state renders as a <select>; other countries render a
			// free-text <input> — same locator, different fill strategy.
			const tagName = await stateField.evaluate( ( el ) => el.tagName );
			if ( tagName === 'SELECT' ) {
				await stateField.selectOption( details.state );
			} else {
				await stateField.fill( details.state );
			}
		}
		await this.page.locator( '#billing-postcode' ).fill( details.postcode );
		if ( details.phone ) {
			await this.page.locator( '#billing-phone' ).fill( details.phone );
		}
	}

	async selectPaymentMethod( gatewayId ) {
		await this.page
			.locator( `#radio-control-wc-payment-method-options-${ gatewayId }` )
			.check();
	}

	get placeOrderButton() {
		return this.page.getByRole( 'button', { name: 'Place Order' } );
	}

	async placeOrder() {
		await this.placeOrderButton.click();
		await this.page.waitForURL( /order-received/, { timeout: 30_000 } );
	}
}
