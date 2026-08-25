import { useBlockProps } from '@wordpress/block-editor';

export default function Edit() {
  const blockProps = useBlockProps();

  return <td {...blockProps}>Short product description goes here…</td>;
}
