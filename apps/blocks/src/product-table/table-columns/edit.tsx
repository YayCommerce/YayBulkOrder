import { store as blockEditorStore, InnerBlocks, useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';

type EditProps = {
  clientId: string;
};

export default function Edit({ clientId }: EditProps) {
  const blockProps = useBlockProps();

  const innerBlockCount = useSelect((select) => select(blockEditorStore).getBlockCount(clientId), [clientId]);

  const columnCount = innerBlockCount || DEFAULT_TEMPLATE?.length;

  const { style, ...innerBlockProps } = useInnerBlocksProps({}, { template: DEFAULT_TEMPLATE });

  return (
    <div {...blockProps}>
      <div
        {...innerBlockProps}
        style={{
          ...style,
          display: 'grid',
          gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
        }}
      />
    </div>
  );
}

const DEFAULT_TEMPLATE: InnerBlocks.Props['template'] = [
  ['yay-bulk-order/product-table-column-product', {}],
  // ['yay-bulk-order/product-table-column-sku', {}],
  // ['yay-bulk-order/product-table-column-description', {}],
  ['yay-bulk-order/product-table-column-quantity', {}],
  ['yay-bulk-order/product-table-column-subtotal', {}],
  ['yay-bulk-order/product-table-column-add-to-cart', {}],
  ['yay-bulk-order/product-table-column-select', {}],
];
