import { getConfig, getContext, getElement, store } from '@wordpress/interactivity';

type Context = {
  productId: number;
  quantity: number;
  isLoading: boolean;
};

interface Window {
  wc_add_to_cart_params?: {
    ajax_url?: string;
  };
  jQuery?: any;
}

const storeDef = {
  state: {
    get buttonText(): string {
      const context = getContext<Context>();
      return context.isLoading ? 'Adding...' : 'Add to Cart';
    },
    get buttonStyles() {
      const config = getConfig('yay-bulk-order/bulk-order-form');
      const styles = config?.settings?.styles ?? null;
      return `
        background-color: ${styles?.colors?.backgroundNormal ?? '#0073aa'};
        color: ${styles?.colors?.textNormal ?? '#ffffff'};
        border-radius: ${styles?.borderRadius === 'small' ? '4px' : styles?.borderRadius === 'large' ? '20px' : '8px'};
      `;
    },
  },
  callbacks: {
    initQuantity() {
      const context = getContext<Context>();
      if (!context.quantity || context.quantity < 1) {
        const config = getConfig('yay-bulk-order/bulk-order-form');
        context.quantity = config?.settings?.defaultCartQuantity ?? 1;
      }
    },
  },
  actions: {
    updateQuantity(event: Event) {
      const context = getContext<Context>();
      const input = event.target as HTMLInputElement;
      const quantity = parseInt(input.value, 10);
      context.quantity = isNaN(quantity) ? 0 : quantity;
    },
    *addToCart() {
      const context = getContext<Context>();
      const { ref } = getElement();
      const { productId, quantity, isLoading } = context;
      if (isLoading || !productId) {
        return;
      }

      if (!Number.isInteger(quantity) || quantity < 1) {
        alert('Please enter a valid quantity (greater than 0).');
        return;
      }

      context.isLoading = true;

      try {
        const win = typeof window !== 'undefined' ? (window as Window) : undefined;

        // Try AJAX first if WooCommerce params are available
        if (win?.wc_add_to_cart_params?.ajax_url) {
          const ajaxUrl = win.wc_add_to_cart_params.ajax_url;
          const formData = new FormData();
          formData.append('action', 'woocommerce_add_to_cart');
          formData.append('product_id', productId.toString());
          formData.append('quantity', quantity.toString());

          const response = yield fetch(ajaxUrl, {
            method: 'POST',
            body: formData,
          });

          const data = yield response.json();

          if (data.error) {
            alert(data.error_message || 'Error adding product to cart');
          } else {
            // Trigger cart update event for cart summary
            document.dispatchEvent(new CustomEvent('yay-bulk-order-cart-updated'));

            const $body = win?.jQuery(document.body);
            // Trigger WooCommerce cart fragments update
            if ($body.trigger) {
              $body.trigger('added_to_cart', [
                data.fragments || {},
                data.cart_hash || '',
                win?.jQuery(ref),
              ]);
              // Also trigger wc_fragment_refresh for mini cart updates
              $body.trigger('wc_fragment_refresh');
            }
          }
        } else {
          // Fallback: redirect to add to cart URL
          window.location.href = `?add-to-cart=${productId}&quantity=${quantity}`;
        }
      } catch (error) {
        console.error('Error adding to cart:', error);
      } finally {
        context.isLoading = false;
      }
    },
  },
};

store('yay-bulk-order/add-to-cart', storeDef, { lock: true });
