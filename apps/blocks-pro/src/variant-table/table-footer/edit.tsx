import { useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { Icon, closeSmall } from '@wordpress/icons';

export default function Edit() {
  const blockProps = useBlockProps();

  return (
    <div {...blockProps}>
      <div className="ybod-variant-table-total">
        <span className="ybod-variant-table-total__label">{__('Total:', 'yay-bulk-order')}</span>
        <span className="ybod-variant-table-total__amount">£0.00</span>
      </div>
      <div className="ybod-variant-table-actions">
        <button type="button" className="ybod-variant-table-add-to-cart" disabled>
          {__('Add to cart', 'yay-bulk-order')}
        </button>
        <button type="button" className="ybod-variant-table-clear" aria-label={__('Clear selection', 'yay-bulk-order')}>
          <Icon icon={closeSmall} />
        </button>
      </div>
    </div>
  );
}
