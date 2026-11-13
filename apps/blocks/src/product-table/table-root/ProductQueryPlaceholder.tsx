import { ProductQuery, TemplateQuery } from '@yay-bulk-order/product-table-store';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import ProductTablePicker from './ProductTablePicker';
import { ALL_PRODUCTS_OPTION, isProPlan, QUERY_TYPE_OPTIONS, UPGRADE_TO_PRO_URL } from './query-types';

type ProductQueryPlaceholderProps = {
  onSelect: (query: ProductQuery) => void;
  onSelectTemplate: (query: TemplateQuery | null) => void;
};

export default function ProductQueryPlaceholder({ onSelect, onSelectTemplate }: ProductQueryPlaceholderProps) {
  const isPro = isProPlan();

  return (
    <div className="ybod-product-query-placeholder">
      <p className="ybod-product-query-placeholder__title">
        {__('What products do you want to show?', 'yay-bulk-order')}
      </p>

      <div className="ybod-product-query-placeholder__options">
        {[ALL_PRODUCTS_OPTION, ...QUERY_TYPE_OPTIONS].map((option) => {
          const isLocked = !isPro && option.requiresPro;

          return (
            <button
              key={option.queryType}
              type="button"
              className={`ybod-product-query-placeholder__option ${
                isLocked ? 'ybod-product-query-placeholder__option--locked' : ''
              }`}
              aria-disabled={isLocked}
              onClick={() => {
                if (isLocked) {
                  window.open(UPGRADE_TO_PRO_URL, '_blank', 'noopener,noreferrer');
                  return;
                }
                onSelect(option.defaultQuery);
                onSelectTemplate(null);
              }}
            >
              {isLocked && (
                <span className="ybod-product-query-placeholder__pro-badge">{__('Pro', 'yay-bulk-order')}</span>
              )}
              <Icon icon={option.icon} size={24} />
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>

      <p className="ybod-product-query-placeholder__title">
        {__('Or, Pick from your saved product tables', 'yay-bulk-order')}
      </p>

      <div className="ybod-product-query-placeholder__product-table">
        <ProductTablePicker onSelect={onSelect} onSelectTemplate={onSelectTemplate} />
      </div>
    </div>
  );
}
