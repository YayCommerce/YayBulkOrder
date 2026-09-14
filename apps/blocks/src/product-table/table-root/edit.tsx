import { useEffect, useState } from 'react';
import { ProductQuery, ProductTableAttributes, TemplateQuery } from '@yay-bulk-order/product-table-store';
import { store as blockEditorStore, InnerBlocks, useBlockProps, Warning } from '@wordpress/block-editor';
import { BlockEditProps } from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

import metadata from './block.json';
import ProductQueryPlaceholder from './ProductQueryPlaceholder';
import { INHERIT_QUERY } from './query-types';
import QueryInspectorControls from './QueryInspectorControls';
import { useFormStyle } from './useFormStyle';
import { useProductArchiveEditorContext } from './useProductArchiveTemplate';

type ProductTableEditProps = BlockEditProps<ProductTableAttributes> & {
  context?: { templateSlug?: string };
};

export default function Edit(props: ProductTableEditProps) {
  const { attributes, setAttributes, clientId, context } = props;
  const { style, ...blockProps } = useBlockProps();
  const [templateQuery, setTemplateQuery] = useState<TemplateQuery | null>(null);
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

  const showPlaceholder = !isCatalogOrArchiveTemplate && !attributes.hasSelectedQuery && !hasInnerBlocks;

  const handleSelectQuery = (productQuery: ProductQuery) => {
    setAttributes({ productQuery, hasSelectedQuery: true });
  };

  const handleSelectTemplateQuery = (query: TemplateQuery | null) => {
    setTemplateQuery(query);
  };

  if (showPlaceholder) {
    return (
      <div style={{ ...style, ...formStyle }} {...blockProps}>
        <ProductQueryPlaceholder onSelect={handleSelectQuery} onSelectTemplate={handleSelectTemplateQuery} />
      </div>
    );
  }

  // Wait one frame for the inherit auto-select effect before mounting InnerBlocks,
  // so we don't flash the placeholder-less empty state without attrs set.
  if (isCatalogOrArchiveTemplate && !attributes.hasSelectedQuery && !hasInnerBlocks) {
    return <div style={{ ...style, ...formStyle }} {...blockProps} />;
  }

  const template = buildTemplate(templateQuery, isTaxonomyArchiveTemplate);

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

type ColumnSlug = TemplateQuery['cols'][number];
type BlockTemplate = NonNullable<InnerBlocks.Props['template']>[number];

function block(name: string, attributes: Record<string, unknown> = {}, innerBlocks?: BlockTemplate[]): BlockTemplate {
  return innerBlocks ? [name, attributes, innerBlocks] : [name, attributes];
}

const COLUMN_BLOCKS: Record<ColumnSlug, string> = {
  product: 'yay-bulk-order/product-table-column-product',
  sku: 'yay-bulk-order/product-table-column-sku',
  description: 'yay-bulk-order/product-table-column-description',
  quantity: 'yay-bulk-order/product-table-column-quantity',
  subtotal: 'yay-bulk-order/product-table-column-subtotal',
  'add-to-cart': 'yay-bulk-order/product-table-column-add-to-cart',
};

const DEFAULT_TEMPLATE_QUERY: TemplateQuery = {
  cols: ['product', 'quantity', 'subtotal', 'add-to-cart'],
  hasFilter: true,
  hasSearch: true,
  hasPagination: true,
};

function buildTemplate(templateQuery: TemplateQuery | null, isTaxonomyArchiveTemplate: boolean): BlockTemplate[] {
  const { cols, hasFilter, hasSearch, hasPagination } = templateQuery ?? DEFAULT_TEMPLATE_QUERY;
  // Taxonomy archives already scope products by term, so the filter sidebar never applies there.
  const showFilter = hasFilter && !isTaxonomyArchiveTemplate;

  const toolbarRow = block(
    'core/group',
    { layout: { type: 'flex', justifyContent: 'space-between', flexWrap: 'nowrap' } },
    [
      ...(showFilter ? [block('yay-bulk-order/product-table-filter')] : []),
      ...(hasSearch ? [block('yay-bulk-order/product-table-search')] : []),
      block('yay-bulk-order/cart-summary'),
    ],
  );

  const columns = [
    ...cols.map((slug) => block(COLUMN_BLOCKS[slug])),
    block('yay-bulk-order/product-table-column-select'),
  ];

  const tableAndFooter = block('core/group', { className: 'ybo-table-column' }, [
    block('yay-bulk-order/product-table', {}, [
      block('yay-bulk-order/product-table-header'),
      block('yay-bulk-order/product-table-columns', {}, columns),
    ]),
    block('yay-bulk-order/product-table-footer', {}, [
      ...(hasPagination ? [block('yay-bulk-order/product-table-pagination')] : []),
      block('yay-bulk-order/product-table-bulk-action'),
    ]),
  ]);

  return [
    toolbarRow,
    block('core/group', { className: 'ybo-filter-layout', layout: { type: 'flex', flexWrap: 'nowrap' } }, [
      ...(showFilter ? [block('yay-bulk-order/product-table-filter-sidebar')] : []),
      tableAndFooter,
    ]),
  ];
}
