import { __ } from '@wordpress/i18n';

import TableBuilder from '@/pages/product-tables/table-builder/TableBuilder';
import ProductTablesList from '@/pages/product-tables/table-list/TablesList';

export function ProductTablesPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 2xl:gap-6">
      <div className="flex items-center justify-between gap-x-4 gap-y-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">{__('Product Tables', 'yay-bulk-order')}</h1>
        <TableBuilder />
      </div>

      <div className="grid min-w-0 gap-3">
        <ProductTablesList />
      </div>
    </div>
  );
}
