import { useEffect, useState } from 'react';
import { Icon, Spinner } from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { check } from '@wordpress/icons';

import { fetchProductCategories, ProductCategoryOption } from './api';

type CategoryPickerProps = {
  categoryIds: number[];
  onChange: (categoryIds: number[]) => void;
};

export default function CategoryPicker({ categoryIds, onChange }: CategoryPickerProps) {
  const [categories, setCategories] = useState<ProductCategoryOption[] | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchProductCategories()
      .then((result) => {
        if (!cancelled) {
          setCategories(result);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHasError(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (hasError) {
    return <p>{__('Could not load categories.', 'yay-bulk-order')}</p>;
  }

  if (!categories) {
    return <Spinner />;
  }

  if (categories.length === 0) {
    return <p>{__('No product categories found.', 'yay-bulk-order')}</p>;
  }

  const toggleCategory = (categoryId: number, isChecked: boolean) => {
    onChange(isChecked ? [...categoryIds, categoryId] : categoryIds.filter((id) => id !== categoryId));
  };

  return (
    <div className="ybo-category-picker">
      {categories.map((category) => {
        const isChecked = categoryIds.includes(category.id);

        return (
          <label key={category.id} className="ybo-category-picker__row">
            <input
              type="checkbox"
              className="ybo-category-picker__native-checkbox"
              checked={isChecked}
              onChange={(event) => toggleCategory(category.id, event.target.checked)}
            />
            <span className={`ybo-category-picker__box${isChecked ? ' is-checked' : ''}`} aria-hidden="true">
              {isChecked && <Icon icon={check} size={14} />}
            </span>
            <span className="ybo-category-picker__name">{category.name}</span>
            <span className="ybo-category-picker__badge">
              {sprintf(
                /* translators: %d: number of products in the category */
                _n('%d product', '%d products', category.count, 'yay-bulk-order'),
                category.count,
              )}
            </span>
          </label>
        );
      })}
    </div>
  );
}
