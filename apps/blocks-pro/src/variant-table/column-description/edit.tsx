import { useBlockProps } from '@wordpress/block-editor';

export default function Edit() {
  const blockProps = useBlockProps({ className: 'ybod-table-cell' });

  return <div {...blockProps}>Variation description goes here…</div>;
}
