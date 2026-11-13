import { useCallback, useEffect, useState } from 'react';
import { ComboboxControl } from '@wordpress/components';
import { useDebounce } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';

import { fetchProductById, ProductSearchOption, searchVariableProducts } from './api';

type SingleProductPickerProps = {
  productId: number;
  onSelect: (productId: number) => void;
  /** Compact rendering for the Inspector sidebar: no intro copy, no wrapper card. */
  compact?: boolean;
};

export default function SingleProductPicker({ productId, onSelect, compact = false }: SingleProductPickerProps) {
  const [options, setOptions] = useState<ProductSearchOption[]>([]);
  // The currently selected product, kept separately from the (search-driven)
  // `options` list so its label still resolves even after a search filters it out.
  const [selectedOption, setSelectedOption] = useState<ProductSearchOption | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    searchVariableProducts('').then((products) => {
      if (cancelled) {
        return;
      }
      setOptions(products);
      setHasLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!productId) {
      setSelectedOption(null);
      return;
    }

    if (selectedOption?.id === productId) {
      return;
    }

    let cancelled = false;
    fetchProductById(productId).then((product) => {
      if (!cancelled && product) {
        setSelectedOption(product);
      }
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const runSearch = useCallback((input: string) => {
    searchVariableProducts(input).then(setOptions);
  }, []);
  const search = useDebounce(runSearch, 300);

  const visibleOptions =
    selectedOption && !options.some((option) => option.id === selectedOption.id)
      ? [selectedOption, ...options]
      : options;

  const combobox = (
    <>
      <ComboboxControl
        __next40pxDefaultSize
        __nextHasNoMarginBottom
        label={__('Variable product', 'yay-bulk-order')}
        value={productId ? String(productId) : null}
        options={visibleOptions.map((option) => ({ value: String(option.id), label: option.name }))}
        onFilterValueChange={search}
        onChange={(value) => onSelect(value ? Number(value) : 0)}
        allowReset={false}
      />
      {hasLoaded && !options.length && (
        <p className="ybod-variant-table-placeholder__hint">
          {__('No variable products found. Create one first.', 'yay-bulk-order')}
        </p>
      )}
    </>
  );

  if (compact) {
    return combobox;
  }

  return (
    <div className="ybod-variant-table-placeholder">
      <p className="ybod-variant-table-placeholder__title">
        {__('Which variable product should this table show?', 'yay-bulk-order')}
      </p>
      <p className="ybod-variant-table-placeholder__hint">
        {__('On a Single Product page this is automatic — this picker only shows up elsewhere.', 'yay-bulk-order')}
      </p>
      {combobox}
    </div>
  );
}
