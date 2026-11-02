import { useCallback, useEffect, useRef, useState } from 'react';
import { FormTokenField } from '@wordpress/components';
import { useDebounce } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';

import { fetchProductsByIds, ProductSearchOption, searchProducts } from './api';

type HandPickedPickerProps = {
  productIds: number[];
  onChange: (productIds: number[]) => void;
};

const tokenFor = (product: ProductSearchOption) => `${product.name} (#${product.id})`;

export default function HandPickedPicker({ productIds, onChange }: HandPickedPickerProps) {
  const knownProducts = useRef(new Map<string, number>());
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);

  const registerProducts = (products: ProductSearchOption[]) => {
    products.forEach((product) => knownProducts.current.set(tokenFor(product), product.id));
  };

  useEffect(() => {
    let cancelled = false;

    fetchProductsByIds(productIds).then((products) => {
      if (cancelled) {
        return;
      }
      registerProducts(products);
      setSelectedTokens(products.map(tokenFor));
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const runSearch = useCallback((input: string) => {
    if (!input) {
      return;
    }
    searchProducts(input).then((products) => {
      products.forEach((product) => knownProducts.current.set(tokenFor(product), product.id));
      setSuggestions(products.map(tokenFor));
    });
  }, []);
  const search = useDebounce(runSearch, 300);

  const handleChange = (tokens: (string | { value: string })[]) => {
    const nextTokens = tokens.map((token) => (typeof token === 'string' ? token : token.value));
    setSelectedTokens(nextTokens);

    const nextIds = nextTokens
      .map((token) => knownProducts.current.get(token))
      .filter((id): id is number => typeof id === 'number');
    onChange(nextIds);
  };

  return (
    <FormTokenField
      __next40pxDefaultSize
      __experimentalExpandOnFocus
      __experimentalShowHowTo={false}
      label={__('Products', 'yay-bulk-order')}
      value={selectedTokens}
      suggestions={suggestions}
      onInputChange={search}
      onChange={handleChange}
    />
  );
}
