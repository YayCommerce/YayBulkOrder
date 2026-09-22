/**
 * Critical: a variation whose attribute is left as "Any" (e.g. "Any Size")
 * has no attribute picker in the bulk order table — add-to-cart must still
 * work by resolving it to a concrete value itself.
 *
 * Exercises VariationAttributeService::get_variation_selections()
 * (includes/Services/VariationAttributeService.php). See
 * docs/e2e-testing-plan.md, Critical item 3.
 */
import { expect, tags, test } from '../../fixtures/index.js';
import { ProductTablePage } from '../../utils/product-table.page.js';

test(
	'adding an "Any"-valued variation to cart resolves it to a concrete attribute value',
	{ tag: tags.SMOKE },
	async ( { page, variableProduct, bulkOrderTableFactory, wpPageFactory } ) => {
		const anyVariation = variableProduct.variations.find(
			( variation ) => variation.attributes.length === 0
		);

		const table = await bulkOrderTableFactory.create( {
			query: {
				queryBy: 'hand-picked',
				categories: [],
				products: [ variableProduct.product.id ],
			},
		} );

		const tablePage = new ProductTablePage( page );
		await tablePage.goto( wpPageFactory, table.id );

		await tablePage.viewOptionsButton( variableProduct.product.id ).click();
		await expect( tablePage.row( anyVariation.id ) ).toBeVisible();

		await tablePage.setQuantity( anyVariation.id, 2 );
		await tablePage.addToCart( anyVariation.id );
		await expect( tablePage.cartQuantityBadge( anyVariation.id ) ).toHaveText(
			'2'
		);

		const cart = await tablePage.getCart();
		const cartItem = cart.items.find( ( item ) => item.id === anyVariation.id );

		// The whole point: WooCommerce accepted the add-to-cart for this
		// specific "Any Size" variation (rather than rejecting it, or the
		// front end silently no-op'ing on a variation it couldn't resolve
		// an attribute selection for) and recorded the right quantity.
		expect( cartItem ).toBeTruthy();
		expect( cartItem?.quantity ).toBe( 2 );
	}
);
