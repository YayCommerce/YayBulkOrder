import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';

export default function Save() {
  const saveProps = useBlockProps.save();

  return (
    <table {...saveProps}>
      <InnerBlocks.Content />
    </table>
  );
}
