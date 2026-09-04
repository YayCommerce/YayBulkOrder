import { getContext, getElement, store } from '@wordpress/interactivity';

import { getGlobalConfig } from '../utils';
import { initCartSync } from './cartSync';
import type {
  FilterCategoryOptionContext,
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
import { formatCartSubtotal, formatPrice } from './storeApi/currency';

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
  return { visible, totalFormatted: formatCartSubtotal(cart.totals) };
}

const tableQueryParams = new Map<number, Record<string, string | number | null>>();

function buildTableUrl(queryId: number, updates: Record<string, string | number | null>): string {
  tableQueryParams.set(queryId, { ...tableQueryParams.get(queryId), ...updates });

  const url = new URL(window.location.href);
  tableQueryParams.forEach((params, id) => {
    for (const [suffix, value] of Object.entries(params)) {
      const key = `query-${id}-${suffix}`;
      if (value === null || value === '') {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, String(value));
      }
    }
  });
  return url.toString();
}

/**
 * Fetches the filtered page directly and updates the router region
 * without exposing query parameters in the browser URL.
 */
async function navigateWithHiddenParams(fetchUrl: string): Promise<void> {
  const { actions } = await import('@wordpress/interactivity-router');

  try {
    const response = await window.fetch(fetchUrl, { credentials: 'same-origin' });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    const html = await response.text();
    await actions.navigate(window.location.href, { html, replace: true, force: true });
  } catch (error) {
    console.error('Failed to refresh the product table without changing the URL', error);
    await actions.navigate(fetchUrl);
  }
}

/** Applies the current filter/search state and resets to page 1. */
async function navigateToFilterState(context: ProductTableContext): Promise<void> {
  const { queryId } = context.formAttributes;
  const { categories, search } = context.tableState.filter;

  const url = buildTableUrl(queryId, {
    page: null,
    category: categories.length ? categories.join(',') : null,
    search: search || null,
  });

  await navigateWithHiddenParams(url);
}

// Debounces search-as-you-type navigation, one timer per table instance (queryId).
const SEARCH_DEBOUNCE_MS = 400;
const searchDebounceTimers = new Map<number, ReturnType<typeof setTimeout>>();

function scheduleSearchNavigation(context: ProductTableContext): void {
  const { queryId } = context.formAttributes;
  clearTimeout(searchDebounceTimers.get(queryId));
  searchDebounceTimers.set(
    queryId,
    setTimeout(() => {
      searchDebounceTimers.delete(queryId);
      navigateToFilterState(context).catch(console.error);
    }, SEARCH_DEBOUNCE_MS),
  );
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

    get isAddToCartDisabled(): boolean {
      const { isAddingToCart, unitPrice } = getContext<ProductRowContext>();
      return isAddingToCart || unitPrice <= 0;
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
    get isFilterOpen(): boolean {
      const { tableState } = getContext<ProductTableContext>();
      return tableState.filter.isOpen;
    },
    get isFilterActive(): boolean {
      const { tableState } = getContext<ProductTableContext>();
      return tableState.filter.categories.length > 0;
    },
    get hasSearchKeyword(): boolean {
      const { tableState } = getContext<ProductTableContext>();
      return tableState.filter.search.length > 0;
    },
    get showBackToTop(): boolean {
      const { tableState } = getContext<ProductTableContext>();
      return tableState.showBackToTop;
    },
    get showFloatingBulkAction(): boolean {
      const { tableState } = getContext<ProductTableContext>();
      return tableState.bulkActionOutOfView && this.hasSelectedRows;
    },
    get isProductExpanded(): boolean {
      const { tableState, productId } = getContext<ProductRowState>();
      return Boolean(tableState.expandedProducts[productId]);
    },
    get viewOptionsText(): string {
      return this.isProductExpanded ? 'Hide options' : 'View options';
    },
    get isVariationRowHidden(): boolean {
      const { tableState, parentProductId } = getContext<ProductRowState>();
      return !parentProductId || !tableState.expandedProducts[parentProductId];
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
    // Navigates pagination while keeping query params out of the URL.
    *navigatePagination(event: MouseEvent) {
      const { ref } = getElement();

      if (isValidLink(ref) && isValidEvent(event)) {
        event.preventDefault();
        yield navigateWithHiddenParams(ref.href);
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
          variationSelections: context.variationSelections,
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
      const { productId, quantity, variationSelections } = context;
      const checked = (event.target as HTMLInputElement).checked;

      if (checked) {
        context.tableState.select[productId] = { productId, quantity, variationSelections };
      } else {
        delete context.tableState.select[productId];
      }
    },
    clearSelection() {
      const context = getContext<ProductTableContext>();
      context.tableState.select = {};
    },
    toggleProductVariations() {
      const { tableState, productId } = getContext<ProductRowState>();
      tableState.expandedProducts[productId] = !tableState.expandedProducts[productId];
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

      const { productId, quantity, isAddingToCart, variationSelections } = context;
      if (!productId || isAddingToCart) {
        return;
      }
      context.isAddingToCart = true;
      try {
        const cart: StoreApiCart = yield addProductToCart(productId, quantity, variationSelections);
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
    toggleFilterPanel() {
      const context = getContext<ProductTableContext>();
      context.tableState.filter.isOpen = !context.tableState.filter.isOpen;
    },
    closeFilterPanel() {
      const context = getContext<ProductTableContext>();
      context.tableState.filter.isOpen = false;
    },
    // Applies the selected category immediately.
    *selectFilterCategory() {
      const context = getContext<FilterCategoryOptionContext>();
      const { categorySlug } = context;
      const [currentSlug] = context.tableState.filter.categories;

      if ((currentSlug ?? '') === categorySlug) {
        return;
      }

      context.tableState.filter.categories = categorySlug ? [categorySlug] : [];
      yield navigateToFilterState(context);
    },
    updateSearchKeyword(event: Event) {
      const context = getContext<ProductTableContext>();
      context.tableState.filter.search = (event.target as HTMLInputElement).value;
      scheduleSearchNavigation(context);
    },
    *submitSearch(event: Event) {
      event.preventDefault();
      const context = getContext<ProductTableContext>();
      clearTimeout(searchDebounceTimers.get(context.formAttributes.queryId));
      yield navigateToFilterState(context);
    },
    *handleSearchKeydown(event: KeyboardEvent) {
      if (event.key !== 'Enter') {
        return;
      }
      event.preventDefault();
      const context = getContext<ProductTableContext>();
      clearTimeout(searchDebounceTimers.get(context.formAttributes.queryId));
      yield navigateToFilterState(context);
    },
    *clearSearch() {
      const context = getContext<ProductTableContext>();
      if (!context.tableState.filter.search) {
        return;
      }
      clearTimeout(searchDebounceTimers.get(context.formAttributes.queryId));
      context.tableState.filter.search = '';
      yield navigateToFilterState(context);
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
    // Bound to the table header (the top of the table): shows "Back to top"
    // only once it has actually scrolled out of view, instead of always
    // showing it even when the whole table already fits on screen.
    watchBackToTopVisibility() {
      const context = getContext<ProductTableContext>();
      const { ref } = getElement();

      if (!ref) {
        return;
      }

      const observer = new IntersectionObserver(([entry]) => {
        context.tableState.showBackToTop = !entry.isIntersecting;
      });
      observer.observe(ref);

      return () => observer.disconnect();
    },

    watchBulkActionVisibility() {
      const context = getContext<ProductTableContext>();
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
