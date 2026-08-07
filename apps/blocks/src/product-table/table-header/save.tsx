import { useBlockProps } from '@wordpress/block-editor';

export default function Save() {
  const blockProps = useBlockProps.save();

  return (
    <thead {...blockProps} data-wp-init="callbacks.watchBackToTopVisibility">
      <tr>
        <th>Product</th>
        <th>SKU</th>
        <th>Description</th>
        <th>Quantity</th>
        <th>Subtotal</th>
        <th>Add to Cart</th>
        <th></th>
      </tr>
    </thead>
  );
}
