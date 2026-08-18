import { getConfig, getContext, getElement, store } from '@wordpress/interactivity';

import { createPurchaseList, STORE_NAMESPACE } from './purchaseList.api';
import { parseCurrency } from './purchaseList.helpers';
import type {
  FormState,
  ProductItemContext,
  ProductSearchContext,
  PurchaseListConfig,
  RowItemContext,
} from './purchaseList.type';

const config = getConfig(STORE_NAMESPACE) as PurchaseListConfig;
const products = config.metadata.products ?? [];
const currencyData = config.wc_meta.currencyData;

const { state, callbacks } = store(
  STORE_NAMESPACE,
  {
    state: {
      view: 'list',
      products: products,
      form: {
        id: 0,
        name: '',
        products: [],
        total: parseCurrency(0, currencyData),
      } as FormState,
      get isListView() {
        return state.view === 'list';
      },
      get isCreateView() {
        return state.view === 'create';
      },
      get isEditView() {
        return state.view === 'edit';
      },
    },
    actions: {
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
          })),
          total: parseCurrency(0, currencyData),
        };

        callbacks.onFormChange();

        state.view = 'create';
      },
      showEditView() {
        state.view = 'edit';
      },
      toggleSearch(event: FocusEvent) {
        const context = getContext<ProductSearchContext>();

        context.isSearching = event.type === 'focusin';
        state.products = products.filter((product) =>
          product.name.toLowerCase().includes(context.search.toLowerCase()),
        );
      },
      searchProducts(event: InputEvent) {
        const context = getContext<ProductSearchContext>();
        const value = (event.currentTarget as HTMLInputElement).value;

        context.search = value;
        state.products = products.filter((product) => product.name.toLowerCase().includes(value.toLowerCase()));
      },
      selectProduct(event: MouseEvent) {
        event.preventDefault();

        const context = getContext<ProductSearchContext & ProductItemContext>();

        context.search = context.product.name;
        context.isSearching = false;
        context.isSelected = true;

        const target = event.currentTarget as HTMLElement;
        const rowId = target.dataset.rowId ?? 0;

        if (rowId) {
          state.form.products[rowId].productId = context.product.id;
          state.form.products[rowId].quantity = 1;
          callbacks.onFormChange();
        }
      },
      inputQuantity(event: InputEvent) {
        const target = event.currentTarget as HTMLInputElement;
        const rowId = target.dataset.rowId ?? 0;
        const value = target.value;

        if (rowId) {
          state.form.products[rowId].quantity = value;
          callbacks.onFormChange();
        }
      },
      inputListName(event: InputEvent) {
        const target = event.currentTarget as HTMLInputElement;
        const value = target.value;

        state.form.name = value;
      },
      clearProduct() {
        const context = getContext<ProductSearchContext & RowItemContext>();

        context.search = '';
        context.isSelected = false;

        state.form.products[context.row.id] = {
          id: context.row.id,
          quantity: 0,
          subtotal: parseCurrency(0, currencyData),
        };
        callbacks.onFormChange();
      },
      *createPurchaseList() {
        try {
          const res = yield createPurchaseList(state.form);
        } catch (error) {
          console.error(error);
        }
      },
    },
    callbacks: {
      onFormChange() {
        let total = 0.0;
        state.form.products.forEach((row, index) => {
          const filtered = products.filter((pr) => pr.id === row.productId);
          if (!filtered.length) return;

          const productData = filtered[0];

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
