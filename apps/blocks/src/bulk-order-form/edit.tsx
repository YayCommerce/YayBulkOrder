import { useEffect } from 'react';
import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';
import { BlockEditProps } from '@wordpress/blocks';
import { checkUtilsIsReady } from '@yay-bulk-order/utils';

import { Attributes } from './type';

export default function Edit({ attributes }: BlockEditProps<Attributes>) {
  const blockProps = useBlockProps();

  useEffect(() => {
    checkUtilsIsReady();
  }, [attributes]);

  return (
    <div {...blockProps}>
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
      ['yay-bulk-order/table-filter', {}],
      ['yay-bulk-order/table-template', {}],
      ['yay-bulk-order/table-pagination', {}],
    ],
  ],
];
