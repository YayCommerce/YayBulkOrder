import { useBlockProps } from '@wordpress/block-editor';

export default function Edit() {
  const blockProps = useBlockProps({ className: 'ybo-table-cell' });

  return <div {...blockProps}>SKU-0001</div>;
}
