import { ColumnDef } from '@tanstack/react-table';
import { ProductTable } from '@yay-bulk-order/common/src/schemas';
import { CircleCheck, CircleX } from 'lucide-react';
import { __, sprintf } from '@wordpress/i18n';

import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ProductTableActions } from '@/pages/product-tables/table-list/TableColumns/TableActions';
import TableTitle from '@/pages/product-tables/table-list/TableColumns/TableTitle';

const QUERY_BY_LABELS: Record<ProductTable['query']['queryBy'], string> = {
  'all-products': __('All products', 'yay-bulk-order'),
  'by-category': __('By categories', 'yay-bulk-order'),
  featured: __('Featured', 'yay-bulk-order'),
  'on-sale': __('On sale', 'yay-bulk-order'),
  'hand-picked': __('Hand-picked', 'yay-bulk-order'),
};

export const ProductTableColumns: ColumnDef<ProductTable>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        id="select-all"
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label={__('Select all', 'yay-bulk-order')}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        id={`select-${row.original.id}`}
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label={__('Select row', 'yay-bulk-order')}
      />
    ),
    meta: { align: 'center', isCheckbox: true },
    size: 36,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'title',
    header: __('Table title', 'yay-bulk-order'),
    cell: ({ row }) => <TableTitle table={row.original} />,
  },
  {
    id: 'products',
    header: __('Products', 'yay-bulk-order'),
    accessorFn: (row) => row.query.queryBy,
    cell: ({ row }) => {
      const { queryBy, categories, products } = row.original.query;
      return (
        <div className="flex items-center gap-1.5">
          <Badge variant="secondary">{QUERY_BY_LABELS[queryBy]}</Badge>
          {queryBy === 'by-category' && categories?.length && (
            <span className="text-muted-foreground text-xs">
              {/* translators: %d: number of categories */}
              {sprintf(__('%d categories', 'yay-bulk-order'), categories.length)}
            </span>
          )}
          {queryBy === 'hand-picked' && products?.length && (
            <span className="text-muted-foreground text-xs">
              {/* translators: %d: number of products */}
              {sprintf(__('%d products', 'yay-bulk-order'), products.length)}
            </span>
          )}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    id: 'columns',
    header: __('Columns', 'yay-bulk-order'),
    cell: ({ row }) => {
      const enabled = row.original.columns.filter((col) => col.enabled);

      if (!enabled.length) return <span className="text-muted-foreground text-xs">—</span>;

      return (
        <div className="w-50 flex flex-wrap gap-1">
          {enabled.map((col) => (
            <Badge key={col.slug} variant="secondary">
              {col.heading || col.slug}
            </Badge>
          ))}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    id: 'features',
    header: __('Features', 'yay-bulk-order'),
    cell: ({ row }) => {
      const { hasFilter, hasSearch, hasPagination } = row.original.features;

      return (
        <div className="flex flex-col gap-1 py-4">
          <Badge variant="dimmed-outline">
            {hasFilter ? <ActivatedIcon /> : <DeactivatedIcon />}
            {__('Filter', 'yay-bulk-order')}
          </Badge>
          <Badge variant="dimmed-outline">
            {hasSearch ? <ActivatedIcon /> : <DeactivatedIcon />}
            {__('Search', 'yay-bulk-order')}
          </Badge>
          <Badge variant="dimmed-outline">
            {hasPagination ? <ActivatedIcon /> : <DeactivatedIcon />}
            {__('Pagination', 'yay-bulk-order')}
          </Badge>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => <ProductTableActions table={row.original} />,
    meta: { align: 'center' },
    size: 48,
    enableSorting: false,
    enableHiding: false,
  },
];

const ActivatedIcon = () => <CircleCheck className="fill-success text-white" />;
const DeactivatedIcon = () => <CircleX className="fill-destructive text-white" />;
