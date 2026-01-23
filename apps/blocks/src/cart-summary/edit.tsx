import { useBlockProps } from '@wordpress/block-editor';
import { BlockEditProps } from '@wordpress/blocks';

export default function Edit(props: BlockEditProps<unknown>) {
  const blockProps = useBlockProps({
    className: 'wp-block-yay-bulk-order-cart-summary',
  });

  return (
    <div {...blockProps}>
      <div style={{ padding: '20px', border: '1px dashed #ccc', borderRadius: '4px' }}>
        <h3 style={{ marginTop: 0 }}>Cart Summary</h3>
        <p style={{ color: '#666', margin: 0 }}>
          This block will display cart items, totals, and checkout buttons on the frontend.
        </p>
      </div>
    </div>
  );
}
