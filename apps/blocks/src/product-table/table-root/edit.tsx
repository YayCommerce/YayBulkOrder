import { useEffect } from 'react';
import { ProductQuery, ProductTableAttributes } from '@yay-bulk-order/product-table-store';
import { store as blockEditorStore, InnerBlocks, useBlockProps, Warning } from '@wordpress/block-editor';
import { BlockEditProps } from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

import metadata from './block.json';
import ProductQueryPlaceholder from './ProductQueryPlaceholder';
import QueryInspectorControls from './QueryInspectorControls';
import { INHERIT_QUERY } from './query-types';
import { useFormStyle } from './useFormStyle';
import { useProductArchiveEditorContext } from './useProductArchiveTemplate';

type ProductTableEditProps = BlockEditProps<ProductTableAttributes> & {
  context?: { templateSlug?: string };
};

export default function Edit(props: ProductTableEditProps) {
  const { attributes, setAttributes, clientId, context } = props;
  const { style, ...blockProps } = useBlockProps();
  const formStyle = useFormStyle();
  const templateSlug = context?.templateSlug;
  const { isCatalogOrArchive: isCatalogOrArchiveTemplate, isTaxonomyArchive: isTaxonomyArchiveTemplate } =
    useProductArchiveEditorContext(templateSlug);

  const { isNestedInsideAnotherProductTable, siblingQueryIds, hasInnerBlocks } = useSelect(
    (select) => {
      const { getBlockParentsByBlockName, getBlocksByClientId, getClientIdsWithDescendants, getBlocks } =
        select(blockEditorStore);

      const otherProductTables = getBlocksByClientId(getClientIdsWithDescendants()).filter(
        (block) => block?.name === metadata.name && block.clientId !== clientId,
      );

      return {
        isNestedInsideAnotherProductTable: getBlockParentsByBlockName(clientId, metadata.name).length > 0,
        siblingQueryIds: otherProductTables.map((block) => block!.attributes.queryId as number),
        hasInnerBlocks: getBlocks(clientId).length > 0,
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

  // Shop / product archive templates: skip the collection chooser and inherit
  // products from the current catalog / taxonomy context automatically.
  useEffect(() => {
    if (!isCatalogOrArchiveTemplate || attributes.hasSelectedQuery || hasInnerBlocks) {
      return;
    }
    setAttributes({ productQuery: INHERIT_QUERY, hasSelectedQuery: true });
  }, [isCatalogOrArchiveTemplate, attributes.hasSelectedQuery, hasInnerBlocks, setAttributes]);

  if (isNestedInsideAnotherProductTable) {
    return (
      <div {...blockProps}>
        <Warning>
          {__('A Product Table block cannot be placed inside another Product Table block.', 'yay-bulk-order')}
        </Warning>
      </div>
    );
  }

  const showPlaceholder =
    !isCatalogOrArchiveTemplate && !attributes.hasSelectedQuery && !hasInnerBlocks;

  const handleSelectQuery = (productQuery: ProductQuery) => {
    setAttributes({ productQuery, hasSelectedQuery: true });
  };

  if (showPlaceholder) {
    return (
      <div style={{ ...style, ...formStyle }} {...blockProps}>
        <ProductQueryPlaceholder onSelect={handleSelectQuery} />
      </div>
    );
  }

  // Wait one frame for the inherit auto-select effect before mounting InnerBlocks,
  // so we don't flash the placeholder-less empty state without attrs set.
  if (isCatalogOrArchiveTemplate && !attributes.hasSelectedQuery && !hasInnerBlocks) {
    return <div style={{ ...style, ...formStyle }} {...blockProps} />;
  }

  const template = isTaxonomyArchiveTemplate ? DEFAULT_TEMPLATE_WITHOUT_FILTER : DEFAULT_TEMPLATE;

  return (
    <>
      <QueryInspectorControls
        attributes={attributes}
        setAttributes={setAttributes}
        isCatalogOrArchiveTemplate={isCatalogOrArchiveTemplate}
      />
      <div style={{ ...style, ...formStyle }} {...blockProps}>
        <InnerBlocks template={template} />
      </div>
    </>
  );
}

const TOOLBAR_ROW: InnerBlocks.Props['template'] = [
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
];

const TOOLBAR_ROW_WITHOUT_FILTER: InnerBlocks.Props['template'] = [
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
      ['yay-bulk-order/product-table-search', {}],
      ['yay-bulk-order/cart-summary', {}],
    ],
  ],
];

const TABLE_AND_FOOTER: NonNullable<InnerBlocks.Props['template']>[number] = [
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
];

const DEFAULT_TEMPLATE: InnerBlocks.Props['template'] = [
  ...TOOLBAR_ROW,
  [
    'core/group',
    {
      className: 'ybo-filter-layout',
      layout: {
        type: 'flex',
        flexWrap: 'nowrap',
      },
    },
    [['yay-bulk-order/product-table-filter-sidebar', {}], TABLE_AND_FOOTER],
  ],
];

/** Taxonomy archives: omit Filter toggle + sidebar (products already scoped). */
const DEFAULT_TEMPLATE_WITHOUT_FILTER: InnerBlocks.Props['template'] = [
  ...TOOLBAR_ROW_WITHOUT_FILTER,
  [
    'core/group',
    {
      className: 'ybo-filter-layout',
      layout: {
        type: 'flex',
        flexWrap: 'nowrap',
      },
    },
    [TABLE_AND_FOOTER],
  ],
];
