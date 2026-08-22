import { useEffect } from 'react';
import { ProductTableAttributes } from '@yay-bulk-order/product-table-store';
import { store as blockEditorStore, InnerBlocks, useBlockProps, Warning } from '@wordpress/block-editor';
import { BlockEditProps } from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

import metadata from './block.json';
import { useFormStyle } from './useFormStyle';

export default function Edit(props: BlockEditProps<ProductTableAttributes>) {
  const { attributes, setAttributes, clientId } = props;
  const { style, ...blockProps } = useBlockProps();
  const formStyle = useFormStyle();

  const { isNestedInsideAnotherProductTable, siblingQueryIds } = useSelect(
    (select) => {
      const { getBlockParentsByBlockName, getBlocksByClientId, getClientIdsWithDescendants } = select(blockEditorStore);

      const otherProductTables = getBlocksByClientId(getClientIdsWithDescendants()).filter(
        (block) => block?.name === metadata.name && block.clientId !== clientId,
      );

      return {
        isNestedInsideAnotherProductTable: getBlockParentsByBlockName(clientId, metadata.name).length > 0,
        siblingQueryIds: otherProductTables.map((block) => block!.attributes.queryId as number),
      };
    },
    [clientId],
  );

  useEffect(() => {
    const hasCollision = attributes.queryId === 0 || siblingQueryIds.includes(attributes.queryId);
    if (hasCollision) {
      setAttributes({ queryId: Math.max(0, attributes.queryId, ...siblingQueryIds) + 1 });
    }
  }, [attributes.queryId, siblingQueryIds, setAttributes]);

  if (isNestedInsideAnotherProductTable) {
    return (
      <div {...blockProps}>
        <Warning>
          {__('A Product Table block cannot be placed inside another Product Table block.', 'yay-bulk-order')}
        </Warning>
      </div>
    );
  }

  return (
    <div style={{ ...style, ...formStyle }} {...blockProps}>
      <InnerBlocks template={DEFAULT_TEMPLATE} />
    </div>
  );
}

const DEFAULT_TEMPLATE: InnerBlocks.Props['template'] = [
  [
    'core/group',
    {
      layout: {
        type: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'nowrap',
      },
    },
    [
      ['yay-bulk-order/product-table-filter', {}],
      ['yay-bulk-order/product-table-search', {}],
      ['yay-bulk-order/cart-summary', {}],
    ],
  ],
  [
    'core/group',
    {
      className: 'ybo-filter-layout',
      layout: {
        type: 'flex',
        flexWrap: 'nowrap',
      },
    },
    [
      ['yay-bulk-order/product-table-filter-sidebar', {}],
      [
        'core/group',
        { className: 'ybo-table-column' },
        [
          [
            'yay-bulk-order/product-table',
            {},
            [
              ['yay-bulk-order/product-table-header', {}],
              [
                'yay-bulk-order/product-table-columns',
                {},
                [
                  ['yay-bulk-order/product-table-column-product', {}],
                  // ['yay-bulk-order/product-table-column-sku', {}],
                  // ['yay-bulk-order/product-table-column-description', {}],
                  ['yay-bulk-order/product-table-column-quantity', {}],
                  ['yay-bulk-order/product-table-column-subtotal', {}],
                  ['yay-bulk-order/product-table-column-add-to-cart', {}],
                  ['yay-bulk-order/product-table-column-select', {}],
                ],
              ],
            ],
          ],
          [
            'yay-bulk-order/product-table-footer',
            {},
            [
              ['yay-bulk-order/product-table-pagination', {}],
              ['yay-bulk-order/product-table-bulk-action', {}],
            ],
          ],
        ],
      ],
    ],
  ],
];
