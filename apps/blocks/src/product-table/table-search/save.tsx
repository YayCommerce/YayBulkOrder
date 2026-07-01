import { useBlockProps } from '@wordpress/block-editor';

export default function Save() {
  const blockProps = useBlockProps.save();

  return <input {...blockProps} placeholder="Search" />;
}
