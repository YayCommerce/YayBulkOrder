import { useBlockProps } from '@wordpress/block-editor';
import { BlockEditProps } from '@wordpress/blocks';

export default function Edit(props: BlockEditProps) {
  const blockProps = useBlockProps({ className: 'ybo-table-cell' });

  return (
    <div {...blockProps}>
      <button type="button" className="ybo-add-to-cart-button">
        Add to cart
      </button>
    </div>
  );
}
