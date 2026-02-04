import { getContext, getElement, store } from '@wordpress/interactivity';

import { CartColumnContext, CartColumnState } from './type';

interface Window {
  wc_add_to_cart_params?: {
    ajax_url?: string;
  };
  jQuery?: any;
}

const storeDef = {
  state: {
    get addingButtonText(): string {
      const isAdding = false; // TODO
      return isAdding ? 'Adding...' : 'Add to Cart';
    },
  },
  actions: {
    updateAddingQuantity(event: Event) {
      const context = getContext<CartColumnContext>();
      const input = event.target as HTMLInputElement;
      const quantity = parseInt(input.value, 10);
      context.addingQuantity = isNaN(quantity) ? 0 : quantity;
    },
    updateEditingQuantity(event: Event) {
      const context = getContext<CartColumnContext>();
      const input = event.target as HTMLInputElement;
      const quantity = parseInt(input.value, 10);
      context.editingQuantity = isNaN(quantity) ? 0 : quantity;
    },
    increaseEditingQuantity() {
      const context = getContext<CartColumnContext>();
      context.editingQuantity += context.stepQuantity;
    },
    decreaseEditingQuantity() {
      const context = getContext<CartColumnContext>();
      const newQuantity = context.editingQuantity - context.stepQuantity;
      context.editingQuantity = Math.max(context.minQuantity, newQuantity);
    },
    *addToCart() {
      const context = getContext<CartColumnContext>();
      const { ref } = getElement();
      const { productId, addingQuantity } = context;

      if (!productId) return;
      if (!Number.isInteger(addingQuantity) || addingQuantity < 1) return;

      try {
        const win = typeof window !== 'undefined' ? (window as Window) : undefined;

        // Try AJAX first if WooCommerce params are available
        if (win?.wc_add_to_cart_params?.ajax_url) {
          const ajaxUrl = win.wc_add_to_cart_params.ajax_url;
          const formData = new FormData();
          formData.append('action', 'woocommerce_add_to_cart');
          formData.append('product_id', productId.toString());
          formData.append('quantity', addingQuantity.toString());

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
              $body.trigger('added_to_cart', [data.fragments || {}, data.cart_hash || '', win?.jQuery(ref)]);
              // Also trigger wc_fragment_refresh for mini cart updates
              $body.trigger('wc_fragment_refresh');
            }
          }
        } else {
          // Fallback: redirect to add to cart URL
          window.location.href = `?add-to-cart=${productId}&quantity=${addingQuantity}`;
        }
      } catch (error) {
        console.error('Error adding to cart:', error);
      }
    },
  },
};

type Store = CartColumnState & typeof storeDef;

const { state } = store<Store>('yay-bulk-order/add-to-cart', storeDef, { lock: true });
