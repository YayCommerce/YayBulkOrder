/**
 * Compatibility (per docs/e2e-testing-plan.md sections 2.4/4, Yay Wholesale
 * B2B row): "biến thể bị Wholesale giới hạn theo category vẫn purchasable
 * đúng logic" — `YayWholesale::fix_variation_purchasable()`
 * (includes/Engines/Compatibles/YayWholesale.php) exists specifically to
 * patch `woocommerce_is_purchasable` back to `true` for an "Any"-valued
 * variation that Yay Wholesale B2B's category restriction would otherwise
 * mark unpurchasable.
 *
 * That patch only does anything when
 * `\YayWholesaleB2B\Pro\Helpers\AccessHelpers\CategoryAccessHelper` exists
 * — a PRO-only class. The free/community zip this suite installs
 * (downloads.wordpress.org/plugin/yay-wholesale-b2b.zip, used by both the
 * `with-yay-wholesale-b2b` and `with-all-yay` combos — verified by reading
 * the extracted plugin source: no `Pro/` namespace present at all) never
 * defines it, so `fix_variation_purchasable()` always early-returns
 * unchanged. There is no way to exercise the actual category-restriction
 * fix with this suite's current plugin provisioning (downloading a paid
 * plugin into the container is out of scope — see
 * docs/e2e-testing-plan.md section 11 for the full note).
 *
 * What THIS test verifies instead — the reachable half of the same
 * concern: Yay Wholesale B2B being active at all must not regress the
 * baseline "Any"-variation add-to-cart behavior already covered by
 * tests/shopper/product-table-any-variation-add-to-cart.spec.js (which
 * never runs against a Wholesale-active environment, since it's in the
 * `e2e` project/plain testDir, not `compatibility`).
 */
import { expect, tags, test } from '../../fixtures/compat/index.js';
import { ProductTablePage } from '../../utils/product-table.page.js';
import { isPluginActive } from '../../utils/wp-plugins.js';

test(
	'an "Any"-valued variation still adds to cart correctly with Yay Wholesale B2B active',
	{ tag: tags.REGRESSION },
	async ( { page, variableProduct, bulkOrderTableFactory, wpPageFactory } ) => {
		test.skip(
			! ( await isPluginActive( 'yay-wholesale-b2b' ) ),
			'Requires Yay Wholesale B2B active (the with-yay-wholesale-b2b or with-all-yay combo).'
		);

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
		await expect( tablePage.cartQuantityBadge( anyVariation.id ) ).toHaveText( '2' );

		const cart = await tablePage.getCart();
		const cartItem = cart.items.find( ( item ) => item.id === anyVariation.id );
		expect( cartItem ).toBeTruthy();
		expect( cartItem?.quantity ).toBe( 2 );
	}
);
