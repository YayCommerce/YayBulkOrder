import { useBlockProps } from '@wordpress/block-editor';

export default function Edit() {
  const blockProps = useBlockProps();

  return <td {...blockProps}>SKU-0001</td>;
}
