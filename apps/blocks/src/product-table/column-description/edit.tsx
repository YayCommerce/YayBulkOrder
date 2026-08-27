import { useBlockProps } from '@wordpress/block-editor';

export default function Edit() {
  const blockProps = useBlockProps({ className: 'ybo-table-cell' });

  return <div {...blockProps}>Short product description goes here…</div>;
}
