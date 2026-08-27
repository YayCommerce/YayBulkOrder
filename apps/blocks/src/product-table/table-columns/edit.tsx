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

const Inserter = InserterUntyped as unknown as ComponentType<InserterProps>;

export default function Edit({ clientId }: EditProps) {
  const blockProps = useBlockProps();

  const innerBlockCount = useSelect((select) => select(blockEditorStore).getBlockCount(clientId), [clientId]);

  const columnCount = innerBlockCount || DEFAULT_TEMPLATE?.length;

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
          gridTemplateColumns: `repeat(${columnCount}, 1fr) auto`,
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
