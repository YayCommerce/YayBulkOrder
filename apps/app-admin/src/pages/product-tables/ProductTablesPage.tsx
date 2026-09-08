import { __ } from '@wordpress/i18n';

import TableBuilder from '@/pages/product-tables/table-builder/TableBuilder';
import ProductTablesList from '@/pages/product-tables/table-list/TablesList';

export function ProductTablesPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 2xl:gap-6">
      <TableBuilder />
      <ProductTablesList />
    </div>
  );
}
