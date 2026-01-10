import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import { BlockSaveProps } from '@wordpress/blocks';
import { FormAttributes } from './type';

export default function Save({ attributes }: BlockSaveProps<FormAttributes>) {
  const blockProps = useBlockProps.save();
  const innerBlocksProps = useInnerBlocksProps.save(blockProps);

  const Tag = attributes.tagName || 'div';

  return <Tag {...innerBlocksProps} />;
}
