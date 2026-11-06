import { useCallback, useEffect, useState } from 'react';
import { ProductTable } from '@yay-bulk-order/common/src/schemas';
import { ProductQuery, TemplateQuery } from '@yay-bulk-order/product-table-store';
import { Button, Spinner, TextControl } from '@wordpress/components';
import { useDebounce } from '@wordpress/compose';
import { __, sprintf } from '@wordpress/i18n';

import { searchProductTables } from './api';

const PER_PAGE = 10;

type ProductTablePickerProps = {
  onSelect: (table: ProductQuery) => void;
  onSelectTemplate: (query: TemplateQuery | null) => void;
};

export default function ProductTablePicker({ onSelect, onSelectTemplate }: ProductTablePickerProps) {
  const [inputValue, setInputValue] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [tables, setTables] = useState<ProductTable[] | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [hasError, setHasError] = useState(false);

  const handleSelect = (table: ProductTable) => {
    const { queryBy, categories, products } = table.query;
    const { hasPagination, pageSize, hasFilter, hasSearch } = table.features;

    let query: ProductQuery;
    switch (queryBy) {
      case 'by-category':
        query = { queryType: 'by-category', categoryIds: categories ?? [], hasPagination, pageSize };
        break;
      case 'hand-picked':
        query = { queryType: 'hand-picked', productIds: products ?? [], hasPagination, pageSize };
        break;
      default:
        query = { queryType: queryBy, hasPagination, pageSize };
        break;
    }

    onSelect(query);

    const templateData: TemplateQuery = {
      cols: table.columns.map((c) => c.slug),
      hasFilter,
      hasPagination,
      hasSearch,
    };

    onSelectTemplate(templateData);
  };

  useEffect(() => {
    let cancelled = false;
    setTables(null);
    setHasError(false);

    searchProductTables(search, page, PER_PAGE)
      .then((result) => {
        if (cancelled) {
          return;
        }
        setTables(result.data);
        setTotalPages(Math.max(result.totalPage, 1));
      })
      .catch(() => {
        if (!cancelled) {
          setHasError(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [search, page]);

  const applySearch = useCallback((value: string) => {
    setPage(1);
    setSearch(value);
  }, []);
  const debouncedSearch = useDebounce(applySearch, 300);

  return (
    <div className="ybod-product-table-picker">
      <TextControl
        __next40pxDefaultSize
        __nextHasNoMarginBottom
        placeholder={__('Search by title…', 'yay-bulk-order')}
        value={inputValue}
        onChange={(value) => {
          setInputValue(value);
          debouncedSearch(value);
        }}
      />

      {hasError && <p>{__('Could not load product tables.', 'yay-bulk-order')}</p>}

      {!hasError && !tables && (
        <div className="ybod-product-table-picker__loading">
          <Spinner />
        </div>
      )}

      {!hasError && tables && tables.length === 0 && <p>{__('No product tables found.', 'yay-bulk-order')}</p>}

      {!hasError && tables && tables.length > 0 && (
        <div className="ybod-product-table-picker__table-wrapper">
          <table className="ybod-product-table-picker__table">
            <tbody>
              {tables.map((table) => (
                <tr key={table.id}>
                  <td className="ybod-product-table-picker__title">
                    <span>{table.title}</span>
                  </td>
                  <td className="ybod-product-table-picker__action">
                    <Button variant="primary" onClick={() => handleSelect(table)}>
                      {__('Select', 'yay-bulk-order')}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="ybod-product-table-picker__pagination">
              <Button variant="tertiary" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
                {__('Previous', 'yay-bulk-order')}
              </Button>
              <span className="ybod-product-table-picker__pagination-info">
                {sprintf(
                  /* translators: 1: current page, 2: total pages */
                  __('Page %1$d of %2$d', 'yay-bulk-order'),
                  page,
                  totalPages,
                )}
              </span>
              <Button
                variant="tertiary"
                disabled={page >= totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                {__('Next', 'yay-bulk-order')}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
