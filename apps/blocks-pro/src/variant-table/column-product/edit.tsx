import { useBlockProps } from '@wordpress/block-editor';

export default function Edit() {
  const blockProps = useBlockProps({ className: 'ybod-table-cell' });

  return (
    <div {...blockProps}>
      <span className="ybod-product-cell">
        <span className="ybod-product-thumbnail" />
        <span className="ybod-product-title">Orange, L</span>
      </span>
    </div>
  );
}
