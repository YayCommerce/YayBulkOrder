import { InnerBlocks } from '@wordpress/block-editor';
import { BlockSaveProps } from '@wordpress/blocks';

import { Attributes } from './type';

export default function Save(props: BlockSaveProps<Attributes>) {
  return <InnerBlocks.Content />;
}
