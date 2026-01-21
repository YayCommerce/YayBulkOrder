import { useEffect } from 'react';
import { store as blockEditorStore, InnerBlocks, useBlockProps } from '@wordpress/block-editor';
import { BlockEditProps, BlockInstance } from '@wordpress/blocks';
import { useInstanceId } from '@wordpress/compose';
import { useSelect } from '@wordpress/data';

import { checkUtilsIsReady } from '@yay-bulk-order/utils';
import { BulkOrderFormAttributes } from './type';

export default function Edit(props: BlockEditProps<BulkOrderFormAttributes>) {
  const { clientId, attributes, setAttributes } = props;
  const blockProps = useBlockProps();

  const innerBlocks = useSelect(
    (select) => !!select(blockEditorStore).getClientIdsOfDescendants([clientId]),
    [clientId],
  ) as unknown as BlockInstance[] | undefined;
  const hasInnerBlocks = innerBlocks?.length > 0;

  const queryId = useInstanceId(Edit as React.FC);

  useEffect(() => {
    checkUtilsIsReady();
    if (attributes.queryId === 0) {
      setAttributes({ queryId });
    }
  }, [queryId, attributes, setAttributes]);

  return (
    <div {...blockProps}>
      <pre>Debug: {JSON.stringify({ attributes }, null, 2)}</pre>
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
