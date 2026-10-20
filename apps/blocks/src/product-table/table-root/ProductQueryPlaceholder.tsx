import { ProductQuery } from '@yay-bulk-order/product-table-store';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { ALL_PRODUCTS_OPTION, isProPlan, QUERY_TYPE_OPTIONS, UPGRADE_TO_PRO_URL } from './query-types';

type ProductQueryPlaceholderProps = {
  onSelect: (query: ProductQuery) => void;
};

export default function ProductQueryPlaceholder({ onSelect }: ProductQueryPlaceholderProps) {
  const isPro = isProPlan();

  return (
    <div className="ybo-product-query-placeholder">
      <p className="ybo-product-query-placeholder__title">
        {__('What products do you want to show?', 'yay-bulk-order')}
      </p>

      <div className="ybo-product-query-placeholder__options">
        {[ALL_PRODUCTS_OPTION, ...QUERY_TYPE_OPTIONS].map((option) => {
          const isLocked = !isPro && option.requiresPro;

          return (
            <button
              key={option.queryType}
              type="button"
              className={`ybo-product-query-placeholder__option${
                isLocked ? ' ybo-product-query-placeholder__option--locked' : ''
              }`}
              aria-disabled={isLocked}
              onClick={() => {
                if (isLocked) {
                  window.open(UPGRADE_TO_PRO_URL, '_blank', 'noopener,noreferrer');
                  return;
                }
                onSelect(option.defaultQuery);
              }}
            >
              {isLocked && (
                <span className="ybo-product-query-placeholder__pro-badge">{__('Pro', 'yay-bulk-order')}</span>
              )}
              <Icon icon={option.icon} size={24} />
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
