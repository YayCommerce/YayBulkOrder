import { ProductQuery, ProductTableAttributes } from '@yay-bulk-order/product-table-store';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import CategoryPicker from './CategoryPicker';
import HandPickedPicker from './HandPickedPicker';
import { ALL_PRODUCTS_OPTION, QUERY_TYPE_OPTIONS } from './query-types';

type QueryInspectorControlsProps = {
  attributes: ProductTableAttributes;
  setAttributes: (attrs: Partial<ProductTableAttributes>) => void;
};

const ALL_OPTIONS = [ALL_PRODUCTS_OPTION, ...QUERY_TYPE_OPTIONS];

export default function QueryInspectorControls({ attributes, setAttributes }: QueryInspectorControlsProps) {
  const { productQuery } = attributes;

  const changeQueryType = (queryType: string) => {
    const option = ALL_OPTIONS.find((candidate) => candidate.queryType === queryType);
    if (option) {
      setAttributes({ productQuery: option.defaultQuery });
    }
  };

  const updateQuery = (patch: Partial<ProductQuery>) => {
    setAttributes({ productQuery: { ...productQuery, ...patch } as ProductQuery });
  };

  return (
    <InspectorControls>
      <PanelBody title={__('Products to Show', 'yay-bulk-order')} initialOpen>
        <SelectControl
          __next40pxDefaultSize
          __nextHasNoMarginBottom
          label={__('Collection', 'yay-bulk-order')}
          value={productQuery.queryType}
          options={ALL_OPTIONS.map((option) => ({ label: option.label, value: option.queryType }))}
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
