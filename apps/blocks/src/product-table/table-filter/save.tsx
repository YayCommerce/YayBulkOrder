import { useBlockProps } from '@wordpress/block-editor';

export default function Save() {
  const blockProps = useBlockProps.save();

  return <button {...blockProps}>Open Filter Modal</button>;
}
