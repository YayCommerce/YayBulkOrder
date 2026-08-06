import { getContext, getElement, store } from '@wordpress/interactivity';

import type { GlobalConfig } from '../utils';
import { getGlobalConfig } from '../utils';
import type { ProductRowContext, ProductTableContext } from './productTable.type';
import {
  addProductsToCartBatch,
  addProductToCart,
  formatCartTotal,
  STORE_NAMESPACE,
  syncWooCommerceCart,
} from './storeApi';

type ProductRowState = ProductRowContext & ProductTableContext;

const storeDef = {
  state: {
    get currentPage(): number {
      const context = getContext<ProductTableContext>();
      return context.tableState.pagination.pageIndex + 1;
    },
    get isNotSimpleProduct(): boolean {
      const { productType } = getContext<ProductRowContext>();
      return productType !== 'simple';
    },
    get subtotal() {
      const { unitPrice, quantity } = getContext<ProductRowContext>();
      return unitPrice * quantity;
    },
    get subtotalFormatted() {
      const { unitPrice, quantity, productType, variantId } = getContext<ProductRowContext>();
      const { currency } = getGlobalConfig().settings.general;

      switch (productType) {
        case 'simple':
          return formatPrice(unitPrice * quantity, currency);
        case 'variable':
          return !variantId ? `From ${formatPrice(unitPrice, currency)}` : formatPrice(unitPrice * quantity, currency);
        case 'external':
          return unitPrice > 0 ? formatPrice(unitPrice, currency) : '—';
        default:
          return '—';
      }
    },
    get addToCartText(): string {
      const { isAddingToCart, cartQuantity, addToCartText } = getContext<ProductRowContext>();
      if (isAddingToCart) {
        return '';
      }
      return cartQuantity > 0 ? 'Add more' : addToCartText;
    },
    get isRowSelected(): boolean {
      const { tableState, productId } = getContext<ProductRowState>();
      return Boolean(tableState.select[productId]);
    },
    get selectedCount(): number {
      const { tableState } = getContext<ProductTableContext>();
      return Object.keys(tableState.select).length;
    },
    get selectedQuantityTotal(): number {
      const { tableState } = getContext<ProductTableContext>();
      return Object.values(tableState.select).reduce((total, row) => total + row.quantity, 0);
    },
    get hasSelectedRows(): boolean {
      const { tableState } = getContext<ProductTableContext>();
      return Object.keys(tableState.select).length > 0;
    },
    get bulkAddToCartText(): string {
      const { tableState } = getContext<ProductTableContext>();
      if (tableState.bulkAdding) {
        return 'Adding...';
      }
      const total = Object.values(tableState.select).reduce((sum, row) => sum + row.quantity, 0);
      return total > 0 ? `Add selected items to cart (${total})` : 'Add selected items to cart';
    },
    get isBulkAddDisabled(): boolean {
      const { tableState } = getContext<ProductTableContext>();
      return tableState.bulkAdding || Object.keys(tableState.select).length === 0;
    },
    get showCartNotice(): boolean {
      const { tableState } = getContext<ProductTableContext>();
      return tableState.cartNotice.visible && !this.hasSelectedRows;
    },
    get cartNoticeText(): string {
      const { tableState } = getContext<ProductTableContext>();
      return `View cart | ${tableState.cartNotice.totalFormatted}`;
    },
    get cartUrl(): string {
      return window.wc_add_to_cart_params?.cart_url ?? '#';
    },
  },
  actions: {
    *navigate(event: MouseEvent) {
      const { ref } = getElement();

      if (isValidLink(ref) && isValidEvent(event)) {
        event.preventDefault();

        const { actions } = yield import('@wordpress/interactivity-router');

        yield actions.navigate(ref.href);
      }
    },
    *prefetchOnHover() {
      const { ref } = getElement();

      if (isValidLink(ref)) {
        const { actions } = yield import('@wordpress/interactivity-router');

        yield actions.prefetch(ref.href);
      }
    },
    updateQuantity(event: Event) {
      const context = getContext<ProductRowState>();
      const quantity = Number((event.target as HTMLInputElement).value);
      context.quantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
      // Keep the bulk selection snapshot in sync if this row is selected.
      const selected = context.tableState.select[context.productId];
      if (selected) {
        context.tableState.select[context.productId] = {
          productId: context.productId,
          quantity: context.quantity,
        };
      }
    },
    scrollToTop(event: MouseEvent) {
      event.preventDefault();
      const { ref } = getElement();
      const root = ref?.closest<HTMLElement>('[data-wp-router-region]');
      root?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    toggleSelectRow(event: Event) {
      const context = getContext<ProductRowState>();
      const { productId, quantity } = context;
      const checked = (event.target as HTMLInputElement).checked;

      if (checked) {
        context.tableState.select[productId] = { productId, quantity };
      } else {
        delete context.tableState.select[productId];
      }
    },
    clearSelection() {
      const context = getContext<ProductTableContext>();
      context.tableState.select = {};
    },
    clearCartNotice() {
      const { tableState } = getContext<ProductTableContext>();
      tableState.cartNotice.visible = false;
    },
    *addSelectedToCart() {
      const context = getContext<ProductTableContext>();
      const { tableState } = context;
      const selectedRows = Object.values(tableState.select);

      if (!selectedRows.length || tableState.bulkAdding) {
        return;
      }

      tableState.bulkAdding = true;
      try {
        const cart = yield addProductsToCartBatch(selectedRows);
        syncWooCommerceCart(cart);
        tableState.select = {};
        tableState.cartNotice = {
          visible: true,
          totalFormatted: formatCartTotal(cart.totals),
        };
      } catch (error) {
        console.error(error);
      } finally {
        tableState.bulkAdding = false;
      }
    },
    *addToCart() {
      const context = getContext<ProductRowContext>();

      const { productId, quantity, isAddingToCart } = context;
      if (!productId || isAddingToCart) {
        return;
      }
      context.isAddingToCart = true;
      try {
        const cart = yield addProductToCart(productId, quantity);
        // find the item in the cart by productId
        const item = cart.items?.find((item) => item.id === productId);
        context.cartQuantity = item?.quantity ?? 0;
        syncWooCommerceCart(cart);
        const tableContext = getContext<ProductTableContext>();
        const { tableState } = tableContext;
        console.log({ cart });
        tableState.cartNotice = {
          visible: tableState.cartNotice.visible,
          totalFormatted: formatCartTotal(cart.totals),
        };
      } catch (error) {
        console.error(error);
      } finally {
        context.isAddingToCart = false;
      }
    },
  },
  callbacks: {
    *prefetch() {
      const { ref } = getElement();
      if (isValidLink(ref)) {
        const { actions } = yield import('@wordpress/interactivity-router');

        yield actions.prefetch(ref.href);
      }
    },
    onRender() {
      const context = getContext<ProductTableContext>();
      const globalConfig = getGlobalConfig();
      console.log('onRender', {
        globalConfig,
        tableState: context.tableState,
        productQuery: context.formAttributes.productQuery,
      });
    },
  },
};

type ProductTableStore = ProductTableContext & typeof storeDef;

store<ProductTableStore>(STORE_NAMESPACE, storeDef, { lock: true });

function isValidLink(ref: HTMLElement | null): ref is HTMLAnchorElement {
  return (
    ref !== null &&
    ref instanceof window.HTMLAnchorElement &&
    !!ref.href &&
    (!ref.target || ref.target === '_self') &&
    ref.origin === window.location.origin
  );
}

function isValidEvent(event: MouseEvent): boolean {
  return (
    event.button === 0 && // Left clicks only.
    !event.metaKey && // Open in new tab (Mac).
    !event.ctrlKey && // Open in new tab (Windows).
    !event.altKey && // Download.
    !event.shiftKey &&
    !event.defaultPrevented
  );
}

export function formatPrice(amount: number, currency: GlobalConfig['settings']['general']['currency']): string {
  const number = amount.toFixed(currency.decimals);

  const parts = number.split('.');

  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousandSep);

  const formatted = parts.length > 1 ? parts.join(currency.decimalSep) : parts[0];

  switch (currency.position) {
    case 'left_space':
      return `${currency.symbol} ${formatted}`;
    case 'right':
      return `${formatted}${currency.symbol}`;
    case 'right_space':
      return `${formatted} ${currency.symbol}`;
    case 'left':
    default:
      return `${currency.symbol}${formatted}`;
  }
}
