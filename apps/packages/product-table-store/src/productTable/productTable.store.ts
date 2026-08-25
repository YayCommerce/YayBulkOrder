import { getContext, getElement, store } from '@wordpress/interactivity';

import type { GlobalConfig } from '../utils';
import { getGlobalConfig } from '../utils';
import type { ProductRowContext, ProductTableContext } from './productTable.type';
import { addProductToCart, STORE_NAMESPACE, syncWooCommerceCart } from './storeApi';

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
      const context = getContext<ProductRowContext>();
      const quantity = Number((event.target as HTMLInputElement).value);
      context.quantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
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
