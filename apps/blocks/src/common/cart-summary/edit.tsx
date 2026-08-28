import { useBlockProps } from '@wordpress/block-editor';
import { BlockEditProps } from '@wordpress/blocks';

export default function Edit(props: BlockEditProps<unknown>) {
  const blockProps = useBlockProps({
    className: 'wp-block-yay-bulk-order-cart-summary',
  });

  return (
    <div {...blockProps}>
      <button type="button">
        <span aria-hidden="true">🛒</span>
        <span>$99.99</span>
        <span>10 items</span>
      </button>
    </div>
  );
}
