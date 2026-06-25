import { InnerBlocks } from '@wordpress/block-editor';
import { BlockSaveProps } from '@wordpress/blocks';

import { BulkOrderFormAttributes } from './type';

export default function Save(props: BlockSaveProps<BulkOrderFormAttributes>) {
  return <InnerBlocks.Content />;
}
