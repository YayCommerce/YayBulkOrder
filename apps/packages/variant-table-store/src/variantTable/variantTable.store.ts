import { initCartSync } from '@yay-bulk-order/common/src/cartSync';
import { getGlobalConfig } from '@yay-bulk-order/common/src/globalConfig';
// `addProductsToCartBatch`/`syncWooCommerceCart` read their Store API
// credentials from the `yay-bulk-order/product-table` interactivity config
// (see `getStoreConfig` in storeApi/index.ts) — variant-table-root/render.php
// deliberately writes its `restUrl`/`nonce` under that same namespace so
// this reused code needs no changes.
import {
  addProductsToCartBatch,
  getStoreApiErrorMessage,
  syncWooCommerceCart,
  type BatchAddResult,
} from '@yay-bulk-order/common/src/storeApi';
import { formatCartSubtotal, formatPrice } from '@yay-bulk-order/common/src/storeApi/currency';
import { getContext, getElement, store } from '@wordpress/interactivity';

import type {
  SelectedVariantRow,
  TableState,
  VariantRowContext,
  VariantRowState,
  VariantTableContext,
} from './variantTable.type';

export const STORE_NAMESPACE = 'yay-bulk-order/variant-table';

/** All currently selected variation rows, derived from the keyed `select` map. */
function getSelectedRows(tableState: TableState): SelectedVariantRow[] {
  return Object.values(tableState.select);
}

function getSelectedQuantityTotal(tableState: TableState): number {
  return getSelectedRows(tableState).reduce((total, row) => total + row.quantity, 0);
}

/** Applies a new row quantity (clamped to a minimum of 1) and keeps the selection snapshot in sync. */
function setRowQuantity(context: VariantRowState, quantity: number): void {
  context.quantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;

  const selected = context.tableState.select[context.variationId];
  if (selected) {
    context.tableState.select[context.variationId] = {
      variationId: context.variationId,
      quantity: context.quantity,
      unitPrice: context.unitPrice,
      variationSelections: context.variationSelections,
    };
  }
}

const storeDef = {
  state: {
    // Latest cart quantities by variation ID.
    externalCartQuantities: {} as Record<number, number>,
    // Unused here (no cart-total notice), but required by `initCartSync`'s
    // shared `CartSyncState` shape.
    externalCartTotalFormatted: '',
    hasSyncedExternalCart: false,

    get isRowSelected(): boolean {
      const { tableState, variationId } = getContext<VariantRowState>();
      return Boolean(tableState.select[variationId]);
    },
    get subtotalFormatted(): string {
      const { unitPrice, quantity } = getContext<VariantRowContext>();
      const { currency } = getGlobalConfig();
      return formatPrice(unitPrice * quantity, currency);
    },
    get selectedCount(): number {
      const { tableState } = getContext<VariantTableContext>();
      return getSelectedRows(tableState).length;
    },
    get selectedQuantityTotal(): number {
      const { tableState } = getContext<VariantTableContext>();
      return getSelectedQuantityTotal(tableState);
    },
    get hasSelectedRows(): boolean {
      const { tableState } = getContext<VariantTableContext>();
      return getSelectedRows(tableState).length > 0;
    },
    get totalFormatted(): string {
      const { tableState } = getContext<VariantTableContext>();
      const { currency } = getGlobalConfig();
      const total = getSelectedRows(tableState).reduce((sum, row) => sum + row.quantity * row.unitPrice, 0);
      return formatPrice(total, currency);
    },
    get addToCartText(): string {
      const { tableState } = getContext<VariantTableContext>();
      if (tableState.bulkAdding) {
        return 'Adding...';
      }
      const count = getSelectedQuantityTotal(tableState);
      return count > 0 ? `Add to cart (${count})` : 'Add to cart';
    },
    get isAddToCartDisabled(): boolean {
      const { tableState } = getContext<VariantTableContext>();
      return tableState.bulkAdding || getSelectedRows(tableState).length === 0;
    },
    get showFloatingBulkAction(): boolean {
      const { tableState } = getContext<VariantTableContext>();
      return tableState.bulkActionOutOfView && this.hasSelectedRows;
    },
    get showCartNotice(): boolean {
      const { tableState } = getContext<VariantTableContext>();
      // Hide the leftover notice again as soon as a new selection starts.
      return tableState.cartNotice.visible && !this.hasSelectedRows;
    },
    get cartNoticeText(): string {
      const { tableState } = getContext<VariantTableContext>();
      return `View cart | ${tableState.cartNotice.totalFormatted}`;
    },
    get showCartError(): boolean {
      const { tableState } = getContext<VariantTableContext>();
      return tableState.cartError.messages.length > 0;
    },
    get cartErrorText(): string {
      const { tableState } = getContext<VariantTableContext>();
      return tableState.cartError.messages.join('\n');
    },
    get cartUrl(): string {
      return window.wc_add_to_cart_params?.cart_url ?? '#';
    },
  },
  actions: {
    updateQuantity(event: Event) {
      const context = getContext<VariantRowState>();
      setRowQuantity(context, Number((event.target as HTMLInputElement).value));
    },
    // +/- stepper buttons flanking the quantity input.
    incrementQuantity() {
      const context = getContext<VariantRowState>();
      setRowQuantity(context, context.quantity + context.quantityStep);
    },
    decrementQuantity() {
      const context = getContext<VariantRowState>();
      setRowQuantity(context, context.quantity - context.quantityStep);
    },
    toggleSelectRow(event: Event) {
      const context = getContext<VariantRowState>();
      const { variationId, quantity, unitPrice, variationSelections } = context;
      const checked = (event.target as HTMLInputElement).checked;

      if (checked) {
        context.tableState.select[variationId] = { variationId, quantity, unitPrice, variationSelections };
      } else {
        delete context.tableState.select[variationId];
      }
    },
    clearSelection() {
      const context = getContext<VariantTableContext>();
      context.tableState.select = {};
    },
    clearCartNotice() {
      const context = getContext<VariantTableContext>();
      context.tableState.cartNotice.visible = false;
    },
    clearCartError() {
      const context = getContext<VariantTableContext>();
      context.tableState.cartError.messages = [];
    },
    *addSelectedToCart() {
      const { tableState } = getContext<VariantTableContext>();
      const selectedRows = getSelectedRows(tableState);

      if (!selectedRows.length || tableState.bulkAdding) {
        return;
      }

      tableState.bulkAdding = true;
      tableState.cartError.messages = [];
      try {
        const items = selectedRows.map(({ variationId, quantity, variationSelections }) => ({
          productId: variationId,
          quantity,
          variationSelections,
        }));
        const { cart, errors, addedCount }: BatchAddResult = yield addProductsToCartBatch(items);
        syncWooCommerceCart(cart);
        if (addedCount > 0) {
          tableState.select = {};
        }
        tableState.cartNotice = { visible: addedCount > 0, totalFormatted: formatCartSubtotal(cart.totals) };
        tableState.cartError.messages = errors;
        applyCartQuantities(cart);
      } catch (error) {
        console.error(error);
        tableState.cartError.messages = [getStoreApiErrorMessage(error)];
      } finally {
        tableState.bulkAdding = false;
      }
    },
  },
  callbacks: {
    // Sync row quantity badges from external cart changes (e.g. added via a
    // different block, or removed from the mini-cart).
    syncCartQuantityFromExternalChange() {
      if (!state.hasSyncedExternalCart) {
        return;
      }

      const context = getContext<VariantRowContext>();
      context.cartQuantity = state.externalCartQuantities[context.variationId] ?? 0;
    },
    // Sync the notice total from external cart changes.
    syncCartNoticeFromExternalChange() {
      if (!state.hasSyncedExternalCart) {
        return;
      }

      const { tableState } = getContext<VariantTableContext>();
      tableState.cartNotice.totalFormatted = state.externalCartTotalFormatted;
    },
    // Bound to the footer: shows the floating bar only once it has actually
    // scrolled out of view, instead of always showing it when the table
    // already fits on screen.
    watchBulkActionVisibility() {
      const context = getContext<VariantTableContext>();
      const { ref } = getElement();

      if (!ref) {
        return;
      }

      const observer = new IntersectionObserver(([entry]) => {
        context.tableState.bulkActionOutOfView = !entry.isIntersecting;
      });
      observer.observe(ref);

      return () => observer.disconnect();
    },
  },
};

type VariantTableStore = VariantTableContext & typeof storeDef;

const { state } = store<VariantTableStore>(STORE_NAMESPACE, storeDef, { lock: true });

// Bootstrap WooCommerce cart synchronization (external cart watching, etc.).
const { applyCartQuantities } = initCartSync(state);
