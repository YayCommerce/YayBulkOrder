import { useBlockProps } from '@wordpress/block-editor';

export default function Edit() {
  const { style, ...blockProps } = useBlockProps();

  return (
    <div
      {...blockProps}
      style={{
        ...style,
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
      }}
    >
      <div>Product</div>
      <div>SKU</div>
      <div>Description</div>
      <div>Quantity</div>
      <div>Subtotal</div>
      <div>Add to Cart</div>
      <div></div>
    </div>
  );
}
