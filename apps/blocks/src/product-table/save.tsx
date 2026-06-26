import { ProductTableAttributes } from '@yay-bulk-order/store';
import { InnerBlocks } from '@wordpress/block-editor';
import { BlockSaveProps } from '@wordpress/blocks';

export default function Save(props: BlockSaveProps<ProductTableAttributes>) {
  return <InnerBlocks.Content />;
}
