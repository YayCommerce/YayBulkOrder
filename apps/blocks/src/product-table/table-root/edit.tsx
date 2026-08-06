import { useEffect } from 'react';
import { ProductTableAttributes } from '@yay-bulk-order/product-table-store';
import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';
import { BlockEditProps } from '@wordpress/blocks';
import { useInstanceId } from '@wordpress/compose';

import { useFormStyle } from './useFormStyle';

export default function Edit(props: BlockEditProps<ProductTableAttributes>) {
  const { attributes, setAttributes } = props;
  const { style, ...blockProps } = useBlockProps();
  const formStyle = useFormStyle();

  const queryId = useInstanceId(Edit as React.FC);

  useEffect(() => {
    if (attributes.queryId === 0) {
      setAttributes({ queryId });
    }
  }, [queryId, attributes, setAttributes]);

  return (
    <div style={{ ...style, ...formStyle }} {...blockProps}>
      <InnerBlocks template={DEFAULT_TEMPLATE} />
    </div>
  );
}

const DEFAULT_TEMPLATE: InnerBlocks.Props['template'] = [
  // [
  //   'core/group',
  //   {},
  //   [],
  // [
  //   'core/group',
  //   {
  //     layout: {
  //       type: 'flex',
  //       justifyContent: 'space-between',
  //       flexWrap: 'nowrap',
  //     },
  //   },
  //   [
  //     ['yay-bulk-order/product-table-filter', {}],
  //     ['yay-bulk-order/product-table-search', {}],
  //     ['yay-bulk-order/cart-summary', {}],
  //   ],
  // ],
  // ],

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
          ['yay-bulk-order/product-table-column-sku', {}],
          ['yay-bulk-order/product-table-column-description', {}],
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
      //['yay-bulk-order/product-table-pagination', {}],
      ['yay-bulk-order/product-table-bulk-action', {}],
    ],
  ],
];
