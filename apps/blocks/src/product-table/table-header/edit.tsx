import { useBlockProps } from '@wordpress/block-editor';

export default function Edit() {
  const { style, ...blockProps } = useBlockProps();

  return (
    <div
      {...blockProps}
      style={{
        ...style,
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
      }}
    >
      <div>Product</div>
      <div>Quantity</div>
      <div>Subtotal</div>
      <div>Add to Cart</div>
    </div>
  );
}
