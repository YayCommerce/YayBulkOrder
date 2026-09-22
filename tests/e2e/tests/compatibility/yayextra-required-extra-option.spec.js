/**
 * Compatibility (per docs/e2e-testing-plan.md section 4, YayExtra row):
 * "Sản phẩm có extra option bắt buộc: add-to-cart hàng loạt từ bảng có
 * thất bại/báo lỗi rõ ràng không, hay âm thầm bỏ qua field bắt buộc".
 *
 * Documents a KNOWN, verified LIMITATION rather than asserting the "safe"
 * outcome — see docs/e2e-testing-plan.md section 10 for the full
 * investigation. Short version: YayExtra's required-field check
 * (`ProductPage::validate_option_fields()`, hooked on
 * `woocommerce_add_to_cart_validation`) early-returns `true` (pass) unless
 * `$_POST['yaye_visibility_option_list']` is present — a hidden field only
 * ever set by YayExtra's OWN classic add-to-cart form JS. The bulk order
 * table adds to cart through WooCommerce's Store API
 * (`wc/store/v1/cart/add-item`), a JSON request body, which never
 * populates `$_POST` — so the required-field check is always bypassed for
 * this plugin's add-to-cart path, regardless of product/field type. This
 * is consistent with the same row's other finding: YayExtra "isn't aware"
 * of this plugin at all — it only ever validates its own classic form
 * submission.
 *
 * This test locks in that verified behavior so a future change (in either
 * plugin, or in WooCommerce's Store API) that starts silently swallowing
 * or start blocking the add-to-cart is caught either way.
 */
import { expect, tags, test } from '../../fixtures/compat/index.js';
import { ProductTablePage } from '../../utils/product-table.page.js';
import { isPluginActive } from '../../utils/wp-plugins.js';

test(
	'add-to-cart from the bulk order table bypasses a required YayExtra extra option, with no error',
	{ tag: tags.REGRESSION },
	async ( { page, productFactory, bulkOrderTableFactory, wpPageFactory, extraOptionSetFactory } ) => {
		test.skip(
			! ( await isPluginActive( 'yayextra' ) ),
			'Requires YayExtra active (the with-yayextra or with-all-yay combo).'
		);

		const product = await productFactory.create( {
			regular_price: '20.00',
			sale_price: '',
		} );
		await extraOptionSetFactory.create( { productId: product.id } );

		const table = await bulkOrderTableFactory.create( {
			query: {
				queryBy: 'hand-picked',
				categories: [],
				products: [ product.id ],
			},
		} );

		const tablePage = new ProductTablePage( page );
		await tablePage.goto( wpPageFactory, table.id );
		await tablePage.setQuantity( product.id, 2 );

		// The bulk order table never renders YayExtra's own option fields (it
		// has no knowledge of them) and never fills the hidden
		// `yaye_visibility_option_list` field their JS would set — so this
		// click sends a plain Store API add-item request with nothing related
		// to the required field.
		const [ addItemResponse ] = await Promise.all( [
			page.waitForResponse( ( response ) =>
				response.url().includes( '/wc/store/v1/cart/add-item' )
			),
			tablePage.addToCart( product.id ),
		] );

		// Store API accepts the request outright — no 400 validation error is
		// ever raised for the missing required field.
		expect( addItemResponse.ok() ).toBe( true );
		await expect( tablePage.cartQuantityBadge( product.id ) ).toHaveText( '2' );

		const cart = await tablePage.getCart();
		const cartItem = cart.items.find( ( item ) => item.id === product.id );
		expect( cartItem, 'product should be in the cart despite the unfilled required field' ).toBeTruthy();
	}
);
