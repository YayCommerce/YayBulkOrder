import { useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

export default function Edit() {
  const blockProps = useBlockProps({ className: 'ybo-table-cell__description' });

  return <div {...blockProps}>{__('Short product description goes here…', 'yay-bulk-order')}</div>;
}
