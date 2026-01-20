import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import { BlockSaveProps } from '@wordpress/blocks';

import { BulkOrderFormAttributes } from './type';

export default function Save(props: BlockSaveProps<BulkOrderFormAttributes>) {
  const blockProps = useBlockProps.save();
  const innerBlocksProps = useInnerBlocksProps.save(blockProps);

  return <div {...innerBlocksProps} />;
}
