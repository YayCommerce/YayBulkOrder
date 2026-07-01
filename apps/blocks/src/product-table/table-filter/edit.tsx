import { useBlockProps } from '@wordpress/block-editor';

export default function Edit() {
  const blockProps = useBlockProps();

  return <button {...blockProps}>Open Filter Modal</button>;
}
