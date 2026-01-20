import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';
import { BlockSaveProps } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

export default function Save(props: BlockSaveProps<unknown>) {
  const blockProps = useBlockProps.save();

  return <InnerBlocks.Content />;
}
