import { ComponentType, useCallback } from 'react';
import {
  store as blockEditorStore,
  InnerBlocks,
  Inserter as InserterUntyped,
  useBlockProps,
  useInnerBlocksProps,
} from '@wordpress/block-editor';
import { Button } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { Icon, plus } from '@wordpress/icons';

import { getGridTemplateColumns } from '../table-header/columns';

type EditProps = {
  clientId: string;
};

type InserterToggleProps = {
  onToggle: () => void;
  isOpen: boolean;
  disabled?: boolean;
};

type InserterProps = {
  rootClientId?: string;
  position?: string;
  __experimentalIsQuick?: boolean;
  shouldDirectInsert?: boolean;
  isAppender?: boolean;
  renderToggle: (props: InserterToggleProps) => JSX.Element;
};

// See the identical comment in product-table's table-columns/edit.tsx: the
// installed `@wordpress/block-editor` types don't fully cover `Inserter`'s
// props even though it's a stable public export.
const Inserter = InserterUntyped as unknown as ComponentType<InserterProps>;

export default function Edit({ clientId }: EditProps) {
  const blockProps = useBlockProps();

  // Same fixed-track grid as table-header/edit.tsx — two separate DOM
  // subtrees in the editor, so they need the *live* column list to stay
  // aligned instead of drifting apart under independent `table-layout: auto`.
  const liveColumnNames = useSelect(
    (select) => select(blockEditorStore).getBlocks(clientId).map((block) => block.name),
    [clientId],
  );

  const ColumnAppender = useCallback(
    () => (
      <Inserter
        position="bottom center"
        rootClientId={clientId}
        __experimentalIsQuick
        shouldDirectInsert={false}
        isAppender
        renderToggle={({ onToggle, disabled, isOpen }) => (
          <Button
            __next40pxDefaultSize
            className="block-editor-button-block-appender"
            onClick={onToggle}
            aria-haspopup="true"
            aria-expanded={isOpen}
            disabled={disabled}
            label={__('Add column', 'yay-bulk-order')}
            showTooltip
          >
            <Icon icon={plus} />
          </Button>
        )}
      />
    ),
    [clientId],
  );

  const { style, ...innerBlockProps } = useInnerBlocksProps(
    {},
    { template: DEFAULT_TEMPLATE, renderAppender: ColumnAppender },
  );

  return (
    <div {...blockProps}>
      <div
        {...innerBlockProps}
        style={{
          ...style,
          display: 'grid',
          alignItems: 'center',
          minWidth: 0,
          gridAutoFlow: 'column',
          gridAutoColumns: 'auto',
          gridTemplateColumns: getGridTemplateColumns(liveColumnNames ?? []),
        }}
      />
    </div>
  );
}

const DEFAULT_TEMPLATE: InnerBlocks.Props['template'] = [
  ['yay-bulk-order/variant-table-column-product', {}],
  ['yay-bulk-order/variant-table-column-quantity', {}],
  ['yay-bulk-order/variant-table-column-select', {}],
];
