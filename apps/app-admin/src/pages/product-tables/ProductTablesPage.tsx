import { __ } from '@wordpress/i18n';

import TableBuilder from '@/pages/product-tables/table-builder/TableBuilder';

export function ProductTablesPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 2xl:gap-6">
      <div className="flex flex-col items-start gap-x-4 gap-y-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">{__('Product Tables', 'yay-bulk-order')}</h1>
      </div>

      <TableBuilder />

      <div className="grid gap-3">
        <div>List of Prebuilt Tables</div>
      </div>
    </div>
  );
}
