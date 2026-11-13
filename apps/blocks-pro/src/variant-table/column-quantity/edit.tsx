import { useBlockProps } from '@wordpress/block-editor';
import { BlockEditProps } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

export default function Edit(props: BlockEditProps) {
  const blockProps = useBlockProps({ className: 'ybod-table-cell' });

  return (
    <div {...blockProps}>
      <div className="ybod-quantity-stepper">
        <button type="button" className="ybod-quantity-stepper__button ybod-quantity-stepper__button--minus" disabled>
          −
        </button>
        <input
          className="ybod-quantity-input"
          type="number"
          min="1"
          defaultValue="1"
          aria-label={__('Quantity', 'yay-bulk-order')}
        />
        <button type="button" className="ybod-quantity-stepper__button ybod-quantity-stepper__button--plus" disabled>
          +
        </button>
      </div>
    </div>
  );
}
