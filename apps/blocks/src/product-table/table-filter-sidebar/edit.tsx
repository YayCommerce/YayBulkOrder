import { useBlockProps } from '@wordpress/block-editor';

export default function Edit() {
  const blockProps = useBlockProps({ style: { display: 'none' } });
  return <div {...blockProps} />;
}
