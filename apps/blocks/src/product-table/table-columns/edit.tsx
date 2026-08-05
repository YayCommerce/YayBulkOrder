import { InnerBlocks, useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

export default function Edit() {
  const blockProps = useBlockProps();
  const { style, ...innerBlockProps } = useInnerBlocksProps({}, { template: DEFAULT_TEMPLATE });

  return (
    <div {...blockProps}>
      <div
        {...innerBlockProps}
        style={{
          ...style,
          display: 'grid',
          gridTemplateColumns: `repeat(${DEFAULT_TEMPLATE.length}, 1fr)`,
        }}
      />
    </div>
  );
}

const DEFAULT_TEMPLATE: InnerBlocks.Props['template'] = [
  ['yay-bulk-order/product-table-column-product', {}],
  ['yay-bulk-order/product-table-column-sku', {}],
  ['yay-bulk-order/product-table-column-description', {}],
  ['yay-bulk-order/product-table-column-quantity', {}],
  ['yay-bulk-order/product-table-column-subtotal', {}],
  ['yay-bulk-order/product-table-column-add-to-cart', {}],
  ['yay-bulk-order/product-table-column-select', {}],
];
