import { useEffect } from 'react';
import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';
import { BlockEditProps } from '@wordpress/blocks';
import { useInstanceId } from '@wordpress/compose';

import { checkUtilsIsReady } from '@yay-bulk-order/utils';
import { BulkOrderFormAttributes } from './type';
import { useFormStyle } from './useFormStyle';

export default function Edit(props: BlockEditProps<BulkOrderFormAttributes>) {
  const { attributes, setAttributes } = props;
  const { style, ...blockProps } = useBlockProps();
  const formStyle = useFormStyle();

  const queryId = useInstanceId(Edit as React.FC);

  useEffect(() => {
    checkUtilsIsReady();
    if (attributes.queryId === 0) {
      setAttributes({ queryId });
    }
  }, [queryId, attributes, setAttributes]);

  return (
    <div style={{ ...style, ...formStyle }} {...blockProps}>
      {/* <pre>Debug: {JSON.stringify({ attributes }, null, 2)}</pre> */}
      <InnerBlocks template={DEFAULT_TEMPLATE} />
    </div>
  );
}

const DEFAULT_TEMPLATE: InnerBlocks.Props['template'] = [
  [
    'core/group',
    {
      style: {
        spacing: {
          blockGap: 'var:preset|spacing|20',
        },
        layout: {
          type: 'flex',
          orientation: 'vertical',
          flexWrap: 'nowrap',
        },
      },
    },
    [
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
          ['yay-bulk-order/table-filter', {}],
          ['yay-bulk-order/cart-summary', {}],
        ],
      ],
      ['yay-bulk-order/table-template', {}],
      ['yay-bulk-order/table-pagination', {}],
    ],
  ],
];
