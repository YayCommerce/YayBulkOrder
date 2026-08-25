import { __ } from '@wordpress/i18n';

declare global {
  interface Window {
    wc?: {
      blocksCheckout?: {
        ExperimentalOrderMeta: (props: { children?: unknown }) => unknown;
      };
    };
  }
}

const Render = () => {
  const { ExperimentalOrderMeta } = window.wc?.blocksCheckout ?? {};

  if (!ExperimentalOrderMeta) {
    return null;
  }

  return (
    <ExperimentalOrderMeta>
      <div className="ybo_slotfill_button_container">
        <button className="ybo_save_pl_cart_button wp-element-button">
          {__('Save as Purchase list', 'yay-bulk-order')}
        </button>
      </div>
    </ExperimentalOrderMeta>
  );
};

export default Render;
