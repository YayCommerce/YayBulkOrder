import { ProductTableAttributes } from '@yay-bulk-order/product-table-store';
import { InnerBlocks } from '@wordpress/block-editor';
import { BlockSaveProps } from '@wordpress/blocks';

export default function Save(props: BlockSaveProps<ProductTableAttributes>) {
  return <InnerBlocks.Content />;
}
