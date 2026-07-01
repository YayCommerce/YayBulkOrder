import { useBlockProps } from '@wordpress/block-editor';

export default function Edit() {
  const blockProps = useBlockProps();

  return <input {...blockProps} placeholder="Search" />;
}
