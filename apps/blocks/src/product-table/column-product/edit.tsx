import { useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

export default function Edit() {
  const blockProps = useBlockProps({ className: 'ybo-table-cell' });

  return (
    <div {...blockProps}>
      <span className="ybo-product-cell">
        <span className="ybo-product-thumbnail" />
        <span className="ybo-product-title">{__('Product name', 'yay-bulk-order')}</span>
      </span>
    </div>
  );
}
