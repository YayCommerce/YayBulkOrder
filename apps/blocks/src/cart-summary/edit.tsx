import { useBlockProps } from '@wordpress/block-editor';
import { BlockEditProps } from '@wordpress/blocks';

export default function Edit(props: BlockEditProps<unknown>) {
  const blockProps = useBlockProps({
    className: 'wp-block-yay-bulk-order-cart-summary',
  });

  return (
    <div {...blockProps}>
      <button>(10 items) $99.99</button>
    </div>
  );
}
