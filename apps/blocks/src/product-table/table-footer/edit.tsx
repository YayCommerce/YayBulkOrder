import { InnerBlocks, useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

export default function Edit() {
  const innerBlocksProps = useInnerBlocksProps(useBlockProps(), { template: DEFAULT_TEMPLATE });

  return <div {...innerBlocksProps} />;
}

const DEFAULT_TEMPLATE: InnerBlocks.Props['template'] = [
  ['yay-bulk-order/product-table-pagination', {}],
  ['yay-bulk-order/product-table-bulk-action', {}],
];
