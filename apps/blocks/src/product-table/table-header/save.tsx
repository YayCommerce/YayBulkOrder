import { useBlockProps } from '@wordpress/block-editor';
import { BlockSaveProps } from '@wordpress/blocks';

import { COLUMN_LABELS } from './columns';

type TableHeaderAttributes = { columns: string[] };

export default function Save({ attributes }: BlockSaveProps<TableHeaderAttributes>) {
  const blockProps = useBlockProps.save();
  const columns = attributes.columns ?? [];

  return (
    <thead {...blockProps} data-wp-init="callbacks.watchBackToTopVisibility">
      <tr>
        {columns.map((name) => (
          <th key={name}>{COLUMN_LABELS[name] ?? ''}</th>
        ))}
      </tr>
    </thead>
  );
}
