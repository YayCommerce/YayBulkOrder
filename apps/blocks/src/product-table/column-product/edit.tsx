import { useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

export default function Edit() {
  const blockProps = useBlockProps({ className: 'ybod-table-cell' });

  return (
    <div {...blockProps}>
      <span className="ybod-product-cell">
        <span className="ybod-product-thumbnail" />
        <span className="ybod-product-title">{__('Product name', 'yay-bulk-order')}</span>
      </span>
    </div>
  );
}
