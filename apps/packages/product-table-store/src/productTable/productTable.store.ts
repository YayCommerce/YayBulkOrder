import { getContext, getElement, store } from '@wordpress/interactivity';

import { getGlobalConfig } from '../utils';
import { initCartSync } from './cartSync';
import type {
  ProductRowContext,
  ProductRowState,
  ProductTableContext,
  SelectedRow,
  TableState,
} from './productTable.type';
import {
  addProductsToCartBatch,
  addProductToCart,
  STORE_NAMESPACE,
  syncWooCommerceCart,
  type StoreApiCart,
} from './storeApi';
import { formatCartTotal, formatPrice } from './storeApi/currency';

/** All currently selected rows, derived from the keyed `select` map. */
function getSelectedRows(tableState: TableState): SelectedRow[] {
  return Object.values(tableState.select);
}

/** Sum of the quantities across all currently selected rows. */
function getSelectedQuantityTotal(tableState: TableState): number {
  return getSelectedRows(tableState).reduce((total, row) => total + row.quantity, 0);
}

/**
 * Builds the "View cart" notice shown after an add-to-cart request.
 * `visible` is passed in rather than hardcoded so callers can either show the
 * notice (bulk add) or just refresh its total while leaving its current
 * visibility untouched (single-row add).
 */
function buildCartNotice(cart: StoreApiCart, visible: boolean): TableState['cartNotice'] {
  return { visible, totalFormatted: formatCartTotal(cart.totals) };
}

const storeDef = {
  state: {
    // Latest cart quantities by product ID.
    externalCartQuantities: {} as Record<number, number>,
    // Latest formatted cart total.
    externalCartTotalFormatted: '',
    // Whether the external cart has been synced.
    hasSyncedExternalCart: false,

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
      return getSelectedRows(tableState).length;
    },
    get selectedQuantityTotal(): number {
      const { tableState } = getContext<ProductTableContext>();
      return getSelectedQuantityTotal(tableState);
    },
    get hasSelectedRows(): boolean {
      const { tableState } = getContext<ProductTableContext>();
      return getSelectedRows(tableState).length > 0;
    },
    get bulkAddToCartText(): string {
      const { tableState } = getContext<ProductTableContext>();
      if (tableState.bulkAdding) {
        return 'Adding...';
      }
      const total = getSelectedQuantityTotal(tableState);
      return total > 0 ? `Add selected items to cart (${total})` : 'Add selected items to cart';
    },
    get isBulkAddDisabled(): boolean {
      const { tableState } = getContext<ProductTableContext>();
      return tableState.bulkAdding || getSelectedRows(tableState).length === 0;
    },
    get showCartNotice(): boolean {
      const { tableState } = getContext<ProductTableContext>();
      // Hide the leftover notice again as soon as a new selection starts.
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
      const { tableState } = getContext<ProductTableContext>();
      const selectedRows = getSelectedRows(tableState);

      if (!selectedRows.length || tableState.bulkAdding) {
        return;
      }

      tableState.bulkAdding = true;
      try {
        const cart: StoreApiCart = yield addProductsToCartBatch(selectedRows);
        syncWooCommerceCart(cart);
        tableState.select = {};
        tableState.cartNotice = buildCartNotice(cart, true);
        // Update row state after a bulk add.
        applyCartQuantities(cart);
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
        const cart: StoreApiCart = yield addProductToCart(productId, quantity);
        const item = cart.items?.find((item) => item.id === productId);
        context.cartQuantity = item?.quantity ?? 0;
        syncWooCommerceCart(cart);
        const { tableState } = getContext<ProductTableContext>();
        // Only refresh the total; leave the notice's current visibility as-is.
        tableState.cartNotice = buildCartNotice(cart, tableState.cartNotice.visible);
        // Sync external state to prevent stale total overwrite.
        applyCartQuantities(cart);
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
    // Sync row quantity from external cart changes.
    syncCartQuantityFromExternalChange() {
      if (!state.hasSyncedExternalCart) {
        return;
      }

      const context = getContext<ProductRowContext>();
      context.cartQuantity = state.externalCartQuantities[context.productId] ?? 0;
    },
    // Sync the notice total from external cart changes.
    syncCartNoticeFromExternalChange() {
      if (!state.hasSyncedExternalCart) {
        return;
      }

      const { tableState } = getContext<ProductTableContext>();
      tableState.cartNotice.totalFormatted = state.externalCartTotalFormatted;
    },
  },
};

type ProductTableStore = ProductTableContext & typeof storeDef;

const { state } = store<ProductTableStore>(STORE_NAMESPACE, storeDef, { lock: true });

// Bootstrap WooCommerce cart synchronization (external cart watching, etc.).
const { applyCartQuantities } = initCartSync(state);

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
