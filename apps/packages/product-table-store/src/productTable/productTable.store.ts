import { initCartSync } from '@yay-bulk-order/common/src/cartSync';
import { getGlobalConfig } from '@yay-bulk-order/common/src/globalConfig';
import {
  addProductsToCartBatch,
  addProductToCart,
  STORE_NAMESPACE,
  syncWooCommerceCart,
  type StoreApiCart,
} from '@yay-bulk-order/common/src/storeApi';
import { formatCartSubtotal, formatPrice } from '@yay-bulk-order/common/src/storeApi/currency';
import { getContext, getElement, store } from '@wordpress/interactivity';

import type {
  FilterCategoryOptionContext,
  FilterRatingOptionContext,
  FilterTagOptionContext,
  PriceSliderContext,
  PriceSliderHandleContext,
  ProductRowContext,
  ProductRowState,
  ProductTableContext,
  SelectedRow,
  TableState,
} from './productTable.type';

/** All currently selected rows, derived from the keyed `select` map. */
function getSelectedRows(tableState: TableState): SelectedRow[] {
  return Object.values(tableState.select);
}

/** Sum of the quantities across all currently selected rows. */
function getSelectedQuantityTotal(tableState: TableState): number {
  return getSelectedRows(tableState).reduce((total, row) => total + row.quantity, 0);
}

/** Applies a new row quantity (clamped to a minimum of 1) and keeps the bulk selection snapshot in sync. */
function setRowQuantity(context: ProductRowState, quantity: number): void {
  context.quantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;

  const selected = context.tableState.select[context.productId];
  if (selected) {
    context.tableState.select[context.productId] = {
      productId: context.productId,
      quantity: context.quantity,
      variationSelections: context.variationSelections,
    };
  }
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

// Must match the `::-webkit-slider-thumb` / `::-moz-range-thumb` width set on
// `.ybo-filter-sidebar__price-slider-input` in table/style.scss.
const PRICE_SLIDER_THUMB_SIZE = 16;

// Smallest allowed gap between the min and max price fields — matches the
// number inputs' own `step="0.01"`. Keeps them from ever being set equal
// (or crossed), which would otherwise leave nothing for the price filter to
// actually filter by.
const MIN_PRICE_INPUT_GAP = 0.01;

// Same idea for the drag handles, but matching the slider's own `step="1"` —
// dragging moves in whole-number increments, so the gap should too.
const MIN_PRICE_DRAG_GAP = 1;

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
 * Raw HTML fetched ahead of a click (from `prefetchOnHover`), keyed by URL.
 * `@wordpress/interactivity-router`'s own prefetch cache isn't reusable here
 * — `navigateWithHiddenParams` feeds it fetched HTML directly instead of
 * asking it to fetch the (hidden-params) URL itself, so without this, every
 * click re-fetched the page from scratch even after already hovering it.
 */
const prefetchedHtml = new Map<string, Promise<string>>();

function fetchHtml(url: string): Promise<string> {
  const normalizedUrl = new URL(url, window.location.href).toString();

  if (!prefetchedHtml.has(normalizedUrl)) {
    const request = window.fetch(normalizedUrl, { credentials: 'same-origin' }).then((response) => {
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      return response.text();
    });
    // Don't cache a failed request — let the next attempt retry the fetch.
    request.catch(() => prefetchedHtml.delete(normalizedUrl));
    prefetchedHtml.set(normalizedUrl, request);
  }

  return prefetchedHtml.get(normalizedUrl) as Promise<string>;
}

/**
 * Fetches the filtered page directly and updates the router region
 * without exposing query parameters in the browser URL.
 */
async function navigateWithHiddenParams(fetchUrl: string, context: ProductTableContext): Promise<void> {
  const { actions } = await import('@wordpress/interactivity-router');
  // await actions.navigate(fetchUrl);
  // return;
  context.tableState.isTableLoading = true;
  try {
    const html = await fetchHtml(fetchUrl);
    await actions.navigate(window.location.href, { html, replace: true, force: true });
  } catch (error) {
    console.error('Failed to refresh the product table without changing the URL', error);
    await actions.navigate(fetchUrl);
  } finally {
    context.tableState.isTableLoading = false;
  }
}

/** Applies the current filter/search state and resets to page 1. */
async function navigateToFilterState(context: ProductTableContext): Promise<void> {
  const { queryId } = context.formAttributes;
  const { categories, tags, search, priceRange, ratings } = context.tableState.filter;

  const url = buildTableUrl(queryId, {
    page: null,
    categories: categories.length ? categories.join(',') : null,
    tags: tags.length ? tags.join(',') : null,
    search: search || null,
    'min-price': priceRange.min || null,
    'max-price': priceRange.max || null,
    rating: ratings.length ? ratings.join(',') : null,
  });

  await navigateWithHiddenParams(url, context);
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

// Same reasoning as search: min/max price each fire their own `change`
// (blur/Enter), and tabbing quickly from one to the other would otherwise
// fire two overlapping navigations that can race and drop one field's
// value. One shared timer per table instance coalesces them into one.
const PRICE_DEBOUNCE_MS = 400;
const priceDebounceTimers = new Map<number, ReturnType<typeof setTimeout>>();

function schedulePriceNavigation(context: ProductTableContext): void {
  const { queryId } = context.formAttributes;
  clearTimeout(priceDebounceTimers.get(queryId));
  priceDebounceTimers.set(
    queryId,
    setTimeout(() => {
      priceDebounceTimers.delete(queryId);
      navigateToFilterState(context).catch(console.error);
    }, PRICE_DEBOUNCE_MS),
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
      const { currency } = getGlobalConfig();
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
      const { isAddingToCart, isPurchasable } = getContext<ProductRowContext>();
      return isAddingToCart || !isPurchasable;
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
    // Drives the sidebar's "Clear filters" button — hidden until at least
    // one sidebar-controlled filter (category, tag, rating, price, search) is active.
    get hasActiveFilters(): boolean {
      const { tableState } = getContext<ProductTableContext>();
      const { categories, tags, ratings, priceRange, search } = tableState.filter;
      return (
        categories.length > 0 ||
        tags.length > 0 ||
        ratings.length > 0 ||
        priceRange.min !== '' ||
        priceRange.max !== '' ||
        search.length > 0
      );
    },
    // Slider handle position. Falls back to the catalog's actual price bounds
    // (rather than 0) when the user hasn't set a bound yet, so an untouched
    // slider starts at its full extremes instead of snapping to zero.
    get priceRangeMinValue(): number {
      const { tableState, priceBounds } = getContext<PriceSliderContext>();
      const parsed = parseFloat(tableState.filter.priceRange.min);
      return Number.isFinite(parsed) ? parsed : priceBounds.min;
    },
    get priceRangeMaxValue(): number {
      const { tableState, priceBounds } = getContext<PriceSliderContext>();
      const parsed = parseFloat(tableState.filter.priceRange.max);
      return Number.isFinite(parsed) ? parsed : priceBounds.max;
    },
    // The real `<input type=range>` thumbs are rendered invisible (see
    // style.scss) — a custom `__price-slider-thumb` span is drawn instead,
    // positioned by this same formula, and the fill's edges use it too.
    // That's deliberate: it guarantees the visible fill and the visible
    // handle always meet exactly, with no gap or overhang, regardless of
    // what pixel size the browser actually renders the (hidden) native
    // thumb at. A plain `X%` position would overshoot at the ends — the
    // handle's travel is inset by half its own width (it can't hang off
    // the edge of the track) — so `calc()` reproduces that same inset.
    get priceSliderFillLeft(): string {
      const { priceBounds } = getContext<PriceSliderContext>();
      // A recalculated bound (see get_price_bounds() in ProductQueryService)
      // can legitimately collapse to a single price — e.g. only one product
      // matches the other active filters. There's no real span to divide by
      // then; show the whole (degenerate) track as filled instead of
      // producing a 0/0-derived position.
      if (priceBounds.max <= priceBounds.min) {
        return `${PRICE_SLIDER_THUMB_SIZE / 2}px`;
      }
      const span = priceBounds.max - priceBounds.min;
      const fraction = (this.priceRangeMinValue - priceBounds.min) / span;
      return `calc(${PRICE_SLIDER_THUMB_SIZE / 2}px + (100% - ${PRICE_SLIDER_THUMB_SIZE}px) * ${fraction})`;
    },
    get priceSliderMaxThumbLeft(): string {
      const { priceBounds } = getContext<PriceSliderContext>();
      if (priceBounds.max <= priceBounds.min) {
        return `calc(100% - ${PRICE_SLIDER_THUMB_SIZE / 2}px)`;
      }
      const span = priceBounds.max - priceBounds.min;
      const fraction = (this.priceRangeMaxValue - priceBounds.min) / span;
      return `calc(${PRICE_SLIDER_THUMB_SIZE / 2}px + (100% - ${PRICE_SLIDER_THUMB_SIZE}px) * ${fraction})`;
    },
    get priceSliderFillRight(): string {
      const { priceBounds } = getContext<PriceSliderContext>();
      if (priceBounds.max <= priceBounds.min) {
        return `${PRICE_SLIDER_THUMB_SIZE / 2}px`;
      }
      const span = priceBounds.max - priceBounds.min;
      const fraction = (priceBounds.max - this.priceRangeMaxValue) / span;
      return `calc(${PRICE_SLIDER_THUMB_SIZE / 2}px + (100% - ${PRICE_SLIDER_THUMB_SIZE}px) * ${fraction})`;
    },
    get showBackToTop(): boolean {
      const { tableState } = getContext<ProductTableContext>();
      return tableState.showBackToTop;
    },
    /** True while a pagination / filter / search click is refetching the table. */
    get isTableLoading(): boolean {
      const { tableState } = getContext<ProductTableContext>();
      return tableState.isTableLoading;
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
    // Warms `fetchHtml`'s cache so `navigatePagination` below doesn't have
    // to wait on a fresh fetch once the click actually lands.
    prefetchOnHover() {
      const { ref } = getElement();

      if (isValidLink(ref)) {
        fetchHtml(ref.href).catch(() => {
          // Ignore — navigatePagination's own fetch will retry and surface the error.
        });
      }
    },
    // Navigates pagination while keeping query params out of the URL.
    *navigatePagination(event: MouseEvent) {
      const { ref } = getElement();

      if (isValidLink(ref) && isValidEvent(event)) {
        event.preventDefault();
        const context = getContext<ProductTableContext>();
        yield navigateWithHiddenParams(ref.href, context);
      }
    },
    updateQuantity(event: Event) {
      const context = getContext<ProductRowState>();
      setRowQuantity(context, Number((event.target as HTMLInputElement).value));
    },
    // +/- stepper buttons flanking the quantity input.
    incrementQuantity() {
      const context = getContext<ProductRowState>();
      setRowQuantity(context, context.quantity + context.quantityStep);
    },
    decrementQuantity() {
      const context = getContext<ProductRowState>();
      setRowQuantity(context, context.quantity - context.quantityStep);
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
    // Toggles one category in/out of the multi-select and applies immediately.
    *toggleFilterCategory() {
      const context = getContext<FilterCategoryOptionContext>();
      const { categorySlug } = context;
      const { categories } = context.tableState.filter;

      context.tableState.filter.categories = categories.includes(categorySlug)
        ? categories.filter((slug) => slug !== categorySlug)
        : [...categories, categorySlug];

      yield navigateToFilterState(context);
    },
    // Toggles one tag in/out of the multi-select and applies immediately.
    *toggleFilterTag() {
      const context = getContext<FilterTagOptionContext>();
      const { tagSlug } = context;
      const { tags } = context.tableState.filter;

      context.tableState.filter.tags = tags.includes(tagSlug)
        ? tags.filter((slug) => slug !== tagSlug)
        : [...tags, tagSlug];

      yield navigateToFilterState(context);
    },
    // Toggles one star rating in/out of the multi-select and applies immediately.
    *toggleFilterRating() {
      const context = getContext<FilterRatingOptionContext>();
      const { ratingValue } = context;
      const { ratings } = context.tableState.filter;

      context.tableState.filter.ratings = ratings.includes(ratingValue)
        ? ratings.filter((value) => value !== ratingValue)
        : [...ratings, ratingValue];

      yield navigateToFilterState(context);
    },
    // Resets every sidebar-controlled filter back to the table's initial
    // (unfiltered) state in one action.
    *clearAllFilters() {
      const context = getContext<ProductTableContext>();
      const { queryId } = context.formAttributes;

      clearTimeout(searchDebounceTimers.get(queryId));
      clearTimeout(priceDebounceTimers.get(queryId));

      context.tableState.filter.categories = [];
      context.tableState.filter.tags = [];
      context.tableState.filter.ratings = [];
      context.tableState.filter.priceRange = { min: '', max: '' };
      context.tableState.filter.search = '';

      yield navigateToFilterState(context);
    },
    // Fires on change (blur/Enter), not per keystroke. Debounced (shared
    // timer with the other price field) so tabbing straight from min to
    // max coalesces into one navigation instead of two racing ones.
    updateMinPrice(event: Event) {
      const context = getContext<ProductTableContext>();
      const priceRange = context.tableState.filter.priceRange;
      const rawValue = (event.target as HTMLInputElement).value;
      const parsedValue = parseFloat(rawValue);
      const currentMax = parseFloat(priceRange.max);
      // A price can't be negative — blockPriceSignKey stops typing "-"/"e"
      // directly, but a paste (or a spinner arrow past 0) can still land
      // here, so it's clamped defensively too.
      let value = rawValue;
      if (Number.isFinite(parsedValue) && parsedValue < 0) {
        value = '0';
      } else if (Number.isFinite(parsedValue) && Number.isFinite(currentMax) && parsedValue >= currentMax) {
        // Never let min reach or pass max — from the keyboard (arrow keys on
        // the range input) or from typing straight into the number field.
        value = String(currentMax - MIN_PRICE_INPUT_GAP);
      }
      context.tableState.filter.priceRange = { ...priceRange, min: value };
      schedulePriceNavigation(context);
    },
    updateMaxPrice(event: Event) {
      const context = getContext<ProductTableContext>();
      const priceRange = context.tableState.filter.priceRange;
      const rawValue = (event.target as HTMLInputElement).value;
      const parsedValue = parseFloat(rawValue);
      const currentMin = parseFloat(priceRange.min);
      let value = rawValue;
      if (Number.isFinite(parsedValue) && parsedValue < 0) {
        value = '0';
      } else if (Number.isFinite(parsedValue) && Number.isFinite(currentMin) && parsedValue <= currentMin) {
        // Never let max reach or drop below min — same reasoning as updateMinPrice.
        value = String(currentMin + MIN_PRICE_INPUT_GAP);
      }
      context.tableState.filter.priceRange = { ...priceRange, max: value };
      schedulePriceNavigation(context);
    },
    // Blocks the keys that would otherwise let a "number" input accept a
    // negative or scientific-notation price ("-12", "1e5") — browsers allow
    // typing these into <input type=number> even with min="0" set; that
    // attribute only affects the spinner and :invalid styling, not typing.
    blockPriceSignKey(event: KeyboardEvent) {
      if (event.key === '-' || event.key === '+' || event.key === 'e' || event.key === 'E') {
        event.preventDefault();
      }
    },
    // Drags the visible slider handle directly, computing the value from the
    // pointer's X position against the track's actual rendered rect. This is
    // the interactive path for mouse/touch — the underlying `<input
    // type=range>` is kept only for keyboard access (arrow keys still fire
    // updateMinPrice/updateMaxPrice above) and is otherwise inert
    // (`pointer-events: none`), because its real native thumb doesn't
    // reliably line up pixel-for-pixel with the custom-drawn handle, and
    // dragging must work by measuring the real DOM, not by assuming it.
    startPriceDrag(event: PointerEvent) {
      const context = getContext<PriceSliderHandleContext>();
      const { priceSliderHandle, priceBounds } = context;
      const { ref: handle } = getElement();
      const track = handle?.parentElement?.querySelector<HTMLElement>('.ybo-filter-sidebar__price-slider-track');

      // Nothing to drag when the recalculated bounds collapse to one price
      // (e.g. only one product matches the other active filters).
      if (!handle || !track || priceBounds.max <= priceBounds.min) {
        return;
      }

      event.preventDefault();
      handle.setPointerCapture(event.pointerId);

      const applyClientX = (clientX: number) => {
        const rect = track.getBoundingClientRect();
        const inset = PRICE_SLIDER_THUMB_SIZE / 2;
        const usableWidth = Math.max(1, rect.width - inset * 2);
        const fraction = Math.min(1, Math.max(0, (clientX - rect.left - inset) / usableWidth));
        const value = Math.round(priceBounds.min + fraction * (priceBounds.max - priceBounds.min));
        const priceRange = context.tableState.filter.priceRange;

        if (priceSliderHandle === 'min') {
          const currentMax = parseFloat(priceRange.max);
          const max = Number.isFinite(currentMax) ? currentMax : priceBounds.max;
          context.tableState.filter.priceRange = { ...priceRange, min: String(Math.min(value, max - MIN_PRICE_DRAG_GAP)) };
        } else {
          const currentMin = parseFloat(priceRange.min);
          const min = Number.isFinite(currentMin) ? currentMin : priceBounds.min;
          context.tableState.filter.priceRange = { ...priceRange, max: String(Math.max(value, min + MIN_PRICE_DRAG_GAP)) };
        }
      };

      applyClientX(event.clientX);

      const handlePointerMove = (moveEvent: PointerEvent) => applyClientX(moveEvent.clientX);
      const handlePointerUp = () => {
        handle.removeEventListener('pointermove', handlePointerMove);
        handle.removeEventListener('pointerup', handlePointerUp);
        schedulePriceNavigation(context);
      };

      handle.addEventListener('pointermove', handlePointerMove);
      handle.addEventListener('pointerup', handlePointerUp);
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
