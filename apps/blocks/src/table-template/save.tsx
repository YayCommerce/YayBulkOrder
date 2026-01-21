import { InnerBlocks } from '@wordpress/block-editor';
import { BlockSaveProps } from '@wordpress/blocks';

export default function Save(props: BlockSaveProps<unknown>) {
  return <InnerBlocks.Content />;
}
