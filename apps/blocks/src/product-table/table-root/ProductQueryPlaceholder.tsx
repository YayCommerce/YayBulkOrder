import { ProductQuery } from '@yay-bulk-order/product-table-store';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { ALL_PRODUCTS_OPTION, QUERY_TYPE_OPTIONS } from './query-types';

type ProductQueryPlaceholderProps = {
  onSelect: (query: ProductQuery) => void;
};

export default function ProductQueryPlaceholder({ onSelect }: ProductQueryPlaceholderProps) {
  return (
    <div className="ybo-product-query-placeholder">
      <p className="ybo-product-query-placeholder__title">
        {__('What products do you want to show?', 'yay-bulk-order')}
      </p>

      <div className="ybo-product-query-placeholder__options">
        {QUERY_TYPE_OPTIONS.map((option) => (
          <button
            key={option.queryType}
            type="button"
            className="ybo-product-query-placeholder__option"
            onClick={() => onSelect(option.defaultQuery)}
          >
            <Icon icon={option.icon} size={24} />
            <span>{option.label}</span>
          </button>
        ))}
      </div>

      <p className="ybo-product-query-placeholder__footer">
        {__('or', 'yay-bulk-order')}{' '}
        <button
          type="button"
          className="ybo-product-query-placeholder__link"
          onClick={() => onSelect(ALL_PRODUCTS_OPTION.defaultQuery)}
        >
          {__('create your own', 'yay-bulk-order')}
        </button>
      </p>
    </div>
  );
}
