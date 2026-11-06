import { ProductQuery, ProductTableAttributes } from '@yay-bulk-order/product-table-store';
import { InspectorControls } from '@wordpress/block-editor';
import { Notice, PanelBody, SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import CategoryPicker from './CategoryPicker';
import HandPickedPicker from './HandPickedPicker';
import { ALL_PRODUCTS_OPTION, INHERIT_OPTION, isProPlan, QUERY_TYPE_OPTIONS } from './query-types';

type QueryInspectorControlsProps = {
  attributes: ProductTableAttributes;
  setAttributes: (attrs: Partial<ProductTableAttributes>) => void;
  isCatalogOrArchiveTemplate?: boolean;
};

const BASE_OPTIONS = [ALL_PRODUCTS_OPTION, ...QUERY_TYPE_OPTIONS];

export default function QueryInspectorControls({
  attributes,
  setAttributes,
  isCatalogOrArchiveTemplate = false,
}: QueryInspectorControlsProps) {
  const { productQuery } = attributes;
  const isInherit = productQuery.queryType === 'inherit';
  const isPro = isProPlan();

  const options = isCatalogOrArchiveTemplate || isInherit ? [INHERIT_OPTION, ...BASE_OPTIONS] : BASE_OPTIONS;

  const changeQueryType = (queryType: string) => {
    const option = options.find((candidate) => candidate.queryType === queryType);
    if (option && !(option.requiresPro && !isPro)) {
      setAttributes({ productQuery: option.defaultQuery });
    }
  };

  const updateQuery = (patch: Partial<ProductQuery>) => {
    setAttributes({ productQuery: { ...productQuery, ...patch } as ProductQuery });
  };

  return (
    <InspectorControls>
      <PanelBody title={__('Products to Show', 'yay-bulk-order')} initialOpen>
        {isInherit && (
          <Notice status="info" isDismissible={false} className="ybod-inherit-notice">
            {__(
              'This table shows products from the current Shop or product archive. Change the collection below to override.',
              'yay-bulk-order',
            )}
          </Notice>
        )}

        <SelectControl
          __next40pxDefaultSize
          __nextHasNoMarginBottom
          label={__('Collection', 'yay-bulk-order')}
          value={productQuery.queryType}
          options={options.map((option) => ({
            label: option.requiresPro && !isPro ? `${option.label} (${__('Pro', 'yay-bulk-order')})` : option.label,
            value: option.queryType,
            disabled: option.requiresPro && !isPro,
          }))}
          onChange={changeQueryType}
        />

        {productQuery.queryType === 'by-category' && (
          <CategoryPicker
            categoryIds={productQuery.categoryIds}
            onChange={(categoryIds) => updateQuery({ categoryIds })}
          />
        )}

        {productQuery.queryType === 'hand-picked' && (
          <HandPickedPicker
            productIds={productQuery.productIds}
            onChange={(productIds) => updateQuery({ productIds })}
          />
        )}
      </PanelBody>
    </InspectorControls>
  );
}
