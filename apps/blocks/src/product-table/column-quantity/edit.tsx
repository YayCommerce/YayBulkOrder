import { useBlockProps } from '@wordpress/block-editor';
import { BlockEditProps } from '@wordpress/blocks';

export default function Edit(props: BlockEditProps) {
  const blockProps = useBlockProps({ className: 'ybo-table-cell' });

  return (
    <div {...blockProps}>
      <div className="ybo-quantity-stepper">
        <button type="button" className="ybo-quantity-stepper__button ybo-quantity-stepper__button--minus" disabled>
          −
        </button>
        <input className="ybo-quantity-input" type="number" min="1" defaultValue="5" aria-label="Quantity" />
        <button type="button" className="ybo-quantity-stepper__button ybo-quantity-stepper__button--plus" disabled>
          +
        </button>
      </div>
    </div>
  );
}
