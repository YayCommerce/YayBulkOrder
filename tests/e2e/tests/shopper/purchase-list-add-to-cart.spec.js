/**
 * Important (Pro): adding a saved Purchase List to the cart from My Account
 * adds every line item in that list with its saved quantity.
 *
 * See docs/e2e-testing-plan.md, Important item 8.
 */
import { expect, tags, test } from '../../fixtures/index.js';
import { logIn } from '../../utils/login.js';
import { PurchaseListPage } from '../../utils/purchase-list.page.js';
import { admin } from '../../utils/test-data.js';

test(
	'adding a purchase list to the cart adds its saved line item and quantity',
	{ tag: tags.REGRESSION },
	async ( { page, purchaseList, product } ) => {
		await logIn( page, admin.username, admin.password );

		const purchaseListPage = new PurchaseListPage( page );
		await purchaseListPage.goto();
		await purchaseListPage.addListToCart( purchaseList.id );

		await expect( async () => {
			const cart = await purchaseListPage.getCart();
			const cartItem = cart.items.find( ( item ) => item.id === product.id );
			expect( cartItem?.quantity ).toBe( 2 );
		} ).toPass();
	}
);
