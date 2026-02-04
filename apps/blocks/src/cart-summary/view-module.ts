import { getConfig, getContext, store } from '@wordpress/interactivity';

declare global {
  interface Window {
    wp?: any;
  }
}

type Context = {
  isOpen: boolean;
  itemCount: number;
  subtotal: string;
};

function formatMoney(value: string | number, totals: any): string {
  const amount = Number(value) / Math.pow(10, totals.currency_minor_unit);

  const formatted = amount
    .toFixed(totals.currency_minor_unit)
    .replace('.', 'DECIMAL')
    .replace(/\B(?=(\d{3})+(?!\d))/g, totals.currency_thousand_separator)
    .replace('DECIMAL', totals.currency_decimal_separator);

  return `${totals.currency_prefix}${formatted}${totals.currency_suffix}`;
}

const storeDef = {
  state: {
    get buttonText() {
      const context = getContext<Context>();
      return context.isOpen ? 'Close Cart' : 'Open Cart';
    },
    get itemCount() {
      const context = getContext<Context>();
      return `(${context.itemCount ?? 0} items)`;
    },
    get isEmpty() {
      const context = getContext<Context>();
      return context.itemCount === 0;
    },
    get subtotal() {
      const context = getContext<Context>();
      return context.subtotal ?? '';
    },
    get buttonStyles() {
      const config = getConfig('yay-bulk-order/cart-summary');
      const styles = config?.settings?.styles ?? null;

      return `
        background-color: ${styles?.colors?.backgroundNormal ?? '#0073aa'};
        color: ${styles?.colors?.textNormal ?? '#ffffff'};
        border-radius: ${styles?.borderRadius === 'small' ? '4px' : styles?.borderRadius === 'large' ? '20px' : '8px'};
      `;
    },
  },
  actions: {
    openMiniCart() {
      const context = getContext<Context>();
      context.isOpen = true;

      document.querySelector('.wc-block-mini-cart__button')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    },
  },

  callbacks: {
    init() {
      const ctx = getContext<Context>();

      const syncFromCartResponse = (data) => {
        if (!data?.totals) return;

        const count = data.items_count ?? 0;
        const subtotal = formatMoney(data.totals.total_items, data.totals);

        ctx.itemCount = count;
        ctx.subtotal = subtotal;
      };

      const cartStore = window.wp?.data?.select?.('wc/store/cart');
      if (cartStore?.getCartData) {
        syncFromCartResponse(cartStore.getCartData());
      }

      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        const response = await originalFetch(...args);

        try {
          const url = typeof args[0] === 'string' ? args[0] : '';
          if (url?.includes('/wc/store/v1/cart')) {
            const cloned = response.clone();
            const json = await cloned.json();
            syncFromCartResponse(json);
          }
        } catch (e) {
          console.error('error', e);
        }
        return response;
      };
    },
  },
};

store('yay-bulk-order/cart-summary', storeDef, { lock: true });
