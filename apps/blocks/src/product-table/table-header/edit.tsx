import { useEffect } from 'react';
import { store as blockEditorStore, useBlockProps } from '@wordpress/block-editor';
import { BlockEditProps } from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';

import { getColumnLabel, getGridTemplateColumns, HeaderColumn, TABLE_COLUMNS_BLOCK_NAME } from './columns';

type TableHeaderAttributes = { columns: HeaderColumn[] };

export default function Edit({ clientId, attributes, setAttributes }: BlockEditProps<TableHeaderAttributes>) {
  const { style, ...blockProps } = useBlockProps();
  const liveColumns = useSelect(
    (select) => {
      const { getBlockRootClientId, getBlocks } = select(blockEditorStore);
      const parentClientId = getBlockRootClientId(clientId);
      if (!parentClientId) {
        return null;
      }

      const columnsBlock = getBlocks(parentClientId).find((block) => block.name === TABLE_COLUMNS_BLOCK_NAME);
      if (!columnsBlock) {
        return null;
      }

      return getBlocks(columnsBlock.clientId)
        .filter(
          (block) =>
            (block.attributes as { metadata?: { blockVisibility?: boolean } })?.metadata?.blockVisibility !== false,
        )
        .map((block) => ({
          name: block.name,
          className: (block.attributes as { className?: string })?.className,
        }));
    },
    [clientId],
  );

  useEffect(() => {
    if (liveColumns && JSON.stringify(liveColumns) !== JSON.stringify(attributes.columns)) {
      setAttributes({ columns: liveColumns });
    }
  }, [liveColumns, attributes.columns, setAttributes]);

  const columns = liveColumns ?? attributes.columns;

  return (
    <div
      {...blockProps}
      style={{
        ...style,
        display: 'grid',
        minWidth: 0,
        gridTemplateColumns: getGridTemplateColumns(columns.map(({ name }) => name)),
      }}
    >
      {columns.map(({ name, className }, index) => (
        <div key={`${name}-${index}`} className={['ybod-table-cell', className].filter(Boolean).join(' ')}>
          {getColumnLabel(name)}
        </div>
      ))}
    </div>
  );
}
