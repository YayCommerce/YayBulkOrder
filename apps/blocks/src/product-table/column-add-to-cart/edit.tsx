import { useBlockProps } from '@wordpress/block-editor';
import { BlockEditProps } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

export default function Edit(props: BlockEditProps) {
  const blockProps = useBlockProps({ className: 'ybo-table-cell' });

  return (
    <div {...blockProps}>
      <button type="button" className="ybo-add-to-cart-button">
        {__('Add to cart', 'yay-bulk-order')}
      </button>
    </div>
  );
}
