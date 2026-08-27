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

// `Inserter` is a genuine, stable public export of `@wordpress/block-editor`
// (used internally by `InnerBlocks.ButtonBlockAppender` itself), but this
// project's `@wordpress/block-editor` types don't fully cover its props —
// they're inferred from a generic `Dropdown`-shaped fallback instead.
// Recast it once here to the props this file actually passes.
const Inserter = InserterUntyped as unknown as ComponentType<InserterProps>;

export default function Edit({ clientId }: EditProps) {
  const blockProps = useBlockProps();

  // Same fixed-track grid as table-header/edit.tsx (see ../table-header/columns.ts
  // for why: these are two separate blocks/DOM subtrees in the editor, so
  // there's no shared table for a real/anonymous `<thead>`/`<tbody>` pairing
  // to align them through — content-based `table-layout: auto` guesses
  // independently and drifts apart. Needs the *live* column list, same as
  // table-header does for itself, since this is what's actually being edited.
  const liveColumnNames = useSelect(
    (select) =>
      select(blockEditorStore)
        .getBlocks(clientId)
        .filter(
          (block) =>
            (block.attributes as { metadata?: { blockVisibility?: boolean } })?.metadata?.blockVisibility !== false,
        )
        .map((block) => block.name),
    [clientId],
  );

  // A copy of `InnerBlocks.ButtonBlockAppender` with two differences:
  //
  // 1. `rootClientId` is captured directly from this block's own `clientId`
  //    prop (closed over here) instead of trusting one to be *passed in* —
  //    the block-list machinery invokes a custom `renderAppender` with zero
  //    props (see `BlockListAppender`), so a component expecting
  //    `rootClientId` as a prop silently gets `undefined` and the resulting
  //    picker scopes to the whole document instead of this column list.
  // 2. `shouldDirectInsert` is turned off: the built-in appender, once only
  //    one column type is still addable, skips the picker and inserts that
  //    block the instant "+" is clicked — too easy to trigger by accident.
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
  ['yay-bulk-order/product-table-column-product', {}],
  // ['yay-bulk-order/product-table-column-sku', {}],
  // ['yay-bulk-order/product-table-column-description', {}],
  ['yay-bulk-order/product-table-column-quantity', {}],
  ['yay-bulk-order/product-table-column-subtotal', {}],
  ['yay-bulk-order/product-table-column-add-to-cart', {}],
  ['yay-bulk-order/product-table-column-select', {}],
];
