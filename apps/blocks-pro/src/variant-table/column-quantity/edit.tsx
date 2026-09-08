import { useBlockProps } from '@wordpress/block-editor';
import { BlockEditProps } from '@wordpress/blocks';

export default function Edit(props: BlockEditProps) {
  const blockProps = useBlockProps({ className: 'ybo-table-cell' });

  return (
    <div {...blockProps}>
      <input className="ybo-quantity-input" type="number" min="1" defaultValue="1" aria-label="Quantity" />
    </div>
  );
}
