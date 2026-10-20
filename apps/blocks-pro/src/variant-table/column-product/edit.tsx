import { useBlockProps } from '@wordpress/block-editor';

export default function Edit() {
  const blockProps = useBlockProps({ className: 'ybo-table-cell' });

  return (
    <div {...blockProps}>
      <span className="ybo-product-cell">
        <span className="ybo-product-thumbnail" />
        <span className="ybo-product-title">Orange, L</span>
      </span>
    </div>
  );
}
