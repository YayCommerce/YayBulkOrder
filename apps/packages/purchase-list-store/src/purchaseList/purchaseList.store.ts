import { getConfig, getContext, getElement, store } from '@wordpress/interactivity';

import {
  addPurchaseListToCart,
  createPurchaseList,
  deletePurchaseList,
  STORE_NAMESPACE,
  updatePurchaseList,
} from './purchaseList.api';
import { getSearchableProducts, parseCurrency } from './purchaseList.helpers';
import {
  GeneralContext,
  type ProductItemContext,
  type PurchaseList,
  type PurchaseListConfig,
  type PurchaseListForm,
  type RowItemContext,
} from './purchaseList.type';

const { __, sprintf } = window.wp.i18n;

const config = getConfig(STORE_NAMESPACE) as PurchaseListConfig;
const products = config.wc_meta.products ?? [];
const currencyData = config.wc_meta.currencyData;
const productsWithPriceText = products.map((product) => ({
  ...product,
  priceText: parseCurrency(product.price, currencyData),
}));

const { state, callbacks } = store(
  STORE_NAMESPACE,
  {
    state: {
      // #region:  Create / Edit View states
      products: productsWithPriceText,
      form: {
        id: 0,
        name: '',
        products: [],
        total: parseCurrency(0, currencyData),
      } as PurchaseListForm,
      // #endregion

      // #region : List View states
      get displayPurchaseLists() {
        const context = getContext<GeneralContext>();
        if (!state.allPurchaseList || !context.page) return { data: [], total: 0, count: 0, countText: '' };

        const purchaseLists: PurchaseList[] = state.allPurchaseList.filter((list: PurchaseList) =>
          list.name.toLowerCase().includes(context.search.toLocaleLowerCase()),
        );
        const startIndex = (context.page - 1) * context.perPage;
        const pageItems = purchaseLists.slice(startIndex, startIndex + context.perPage);

        const countText = sprintf(
          /* translators: %1$d: number of paginated items, %2$d: number of all items */
          __('Showing %1$d of %2$d purchase lists', 'yay-bulk-order'),
          pageItems.length,
          purchaseLists.length,
        );

        return {
          data: pageItems,
          total: purchaseLists.length,
          count: pageItems.length,
          countText,
        };
      },
      get totalPages() {
        if (!state.allPurchaseList) return 0;
        const context = getContext<GeneralContext>();
        const purchaseLists: PurchaseList[] = state.allPurchaseList.filter((list: PurchaseList) =>
          list.name.toLowerCase().includes(context.search.toLocaleLowerCase()),
        );
        return Math.max(1, Math.ceil(purchaseLists.length / context.perPage));
      },
      get isNextPageDisabled() {
        const context = getContext<GeneralContext>();
        return !state.allPurchaseList || !context.page || context.page >= state.totalPages;
      },
      get isPreviousPageDisabled() {
        const context = getContext<GeneralContext>();
        return !state.allPurchaseList || !context.page || context.page - 1 < 1;
      },
      get isEmptyList() {
        return state.displayPurchaseLists.data.length > 0;
      },
      // #endregion

      // #region : Redirect states
      view: 'list',
      get isListView() {
        return state.view === 'list';
      },
      get isCreateView() {
        return state.view === 'create';
      },
      get isEditView() {
        return state.view === 'edit';
      },
      get isCreateEditView() {
        return state.view === 'edit' || state.view === 'create';
      },
      // #endregion
    },
    actions: {
      // #region : Redirect Actions
      showListView() {
        state.view = 'list';
      },
      showCreateView() {
        state.form = {
          id: 0,
          name: '',
          products: Array.from({ length: 5 }, (_, index) => ({
            id: index,
            subtotal: parseCurrency(0, currencyData),
            quantity: 0,
            name: '',
            isSearching: false,
            isSelected: false,
          })),
          total: parseCurrency(0, currencyData),
        };

        callbacks.onFormChange();

        state.view = 'create';
      },
      showEditView() {
        const { ref } = getElement();
        const purchaseListId = parseInt((ref as HTMLElement).dataset.purchaseListId ?? '0');
        if (!purchaseListId) return;

        const purchaseList: PurchaseList | undefined = state.allPurchaseList.find((list) => list.id === purchaseListId);
        if (!purchaseList) return;

        state.form = {
          id: purchaseList.id,
          name: purchaseList.name,
          products: purchaseList.products.map((product, index) => {
            const productData = products.find((pr) => pr.id === product.productId);

            return {
              ...product,
              id: index,
              subtotal: parseCurrency(0, currencyData),
              name: productData ? productData.name : __('This product is not found.', 'yay-bulk-order'),
              isSearching: false,
              isSelected: true,
            };
          }),
          total: 0,
        };
        callbacks.onFormChange();

        state.view = 'edit';
      },
      // #endregion

      // #region : Create / Edit View Actions
      toggleSearch(event: FocusEvent) {
        const context = getContext<RowItemContext>();

        context.row.isSearching = event.type === 'focusin';
        const searchableProducts = getSearchableProducts(productsWithPriceText, state.form.products, context.row.id);
        state.products = searchableProducts.filter((product) =>
          product.name.toLowerCase().includes(context.row.name.toLowerCase()),
        );
      },
      searchProducts() {
        const context = getContext<RowItemContext>();
        const { ref } = getElement();
        const value = (ref as HTMLInputElement).value;

        context.row.name = value;
        const searchableProducts = getSearchableProducts(productsWithPriceText, state.form.products, context.row.id);
        state.products = searchableProducts.filter((product) =>
          product.name.toLowerCase().includes(value.toLowerCase()),
        );
      },
      selectProduct(event: MouseEvent) {
        event.preventDefault();

        const context = getContext<ProductItemContext>();

        const { ref } = getElement();
        const target = ref as HTMLElement;
        const rowId = target.dataset.rowId ?? 0;

        if (rowId) {
          state.form.products[rowId] = {
            ...state.form.products[rowId],
            productId: context.product.id,
            quantity: 1,
            name: context.product.name,
            isSearching: false,
            isSelected: true,
          };
          callbacks.onFormChange();
        }
      },
      inputQuantity() {
        const { ref } = getElement();
        const target = ref as HTMLInputElement;
        const rowId = target.dataset.rowId ?? 0;
        const value = target.value;

        if (rowId) {
          state.form.products[rowId].quantity = value;
          callbacks.onFormChange();
        }
      },
      inputListName() {
        const { ref } = getElement();
        const target = ref as HTMLInputElement;
        const value = target.value;

        (state.form as PurchaseListForm).name = value;
      },
      clearProduct() {
        const context = getContext<RowItemContext>();

        (state.form as PurchaseListForm).products[context.row.id] = {
          id: context.row.id,
          quantity: 0,
          subtotal: parseCurrency(0, currencyData),
          name: '',
          isSelected: false,
          isSearching: false,
        };
        callbacks.onFormChange();
      },
      addNewProductRow() {
        const index = (state.form as PurchaseListForm).products.length;
        (state.form as PurchaseListForm).products.push({
          id: index,
          subtotal: parseCurrency(0, currencyData),
          quantity: 0,
          name: '',
          isSearching: false,
          isSelected: false,
        });
      },
      // #endregion

      // #region : List view actions
      inputListSearch() {
        const { ref } = getElement();
        const target = ref as HTMLInputElement;
        const value = target.value;

        const context = getContext<GeneralContext>();
        context.search = value;
      },
      nextPage() {
        const context = getContext<GeneralContext>();
        context.page += 1;
      },
      previousPage() {
        const context = getContext<GeneralContext>();
        context.page -= 1;
      },
      // #endregion

      // #region : API actions
      *createPurchaseList() {
        const context = getContext<GeneralContext>();
        try {
          context.isPendingCreateList = true;
          const res = yield createPurchaseList(state.form);
          state.view = 'list';
          state.allPurchaseList = [res, ...state.allPurchaseList];
        } catch (error) {
          console.error(error);
          alert(error);
        } finally {
          context.isPendingCreateList = false;
        }
      },
      *updatePurchaseList() {
        const context = getContext<GeneralContext>();
        try {
          context.isPendingUpdateList = true;
          const res = (yield updatePurchaseList(state.form)) as PurchaseList;
          state.allPurchaseList = state.allPurchaseList.map((list: PurchaseList) => (list.id === res.id ? res : list));
        } catch (error) {
          console.error(error);
          alert(error);
        } finally {
          context.isPendingUpdateList = false;
        }
      },
      *deletePurchaseList() {
        const context = getContext<GeneralContext>();
        try {
          context.isPendingDeleteList = true;
          const res = yield deletePurchaseList(state.form);
          state.view = 'list';
          if (res) {
            state.allPurchaseList = state.allPurchaseList.filter((list: PurchaseList) => list.id !== state.form.id);
          }
        } catch (error) {
          console.error(error);
          alert(error);
        } finally {
          context.isPendingDeleteList = false;
        }
      },
      *addToCart() {
        const context = getContext<GeneralContext>();
        try {
          context.isPendingAddToCart = true;
          const res = (yield addPurchaseListToCart(state.form)) as { cartUrl: string };
          window.location.assign(res.cartUrl);
        } catch (error) {
          console.error(error);
          alert(error);
        } finally {
          context.isPendingAddToCart = false;
        }
      },
      // #endregion
    },
    callbacks: {
      onFormChange() {
        let total = 0.0;
        state.form.products.forEach((row, index) => {
          const productData = products.find((pr) => pr.id === row.productId);
          if (!productData) return;

          const subtotal = productData.price * (row.quantity ?? 0);
          total += subtotal;
          console.log(currencyData);
          state.form.products[index].subtotal = parseCurrency(subtotal, currencyData);
        });

        state.form.total = parseCurrency(total, currencyData);
      },
    },
  },
  { lock: true },
);

console.log(state);
