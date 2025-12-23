import { createColumnHelper } from '@tanstack/react-table';
import { ChevronDown, ChevronsUpDown, ChevronUp, ExternalLink } from 'lucide-react';

import { Product } from '@/lib/queries';
import { __ } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

const SortableHeader = ({ column, children }: { column: any; children: React.ReactNode }) => {
  const isSorted = column.getIsSorted();

  return (
    <Button
      variant="ghost"
      onClick={column.getToggleSortingHandler()}
      className="h-auto cursor-pointer p-0 font-medium hover:bg-transparent"
    >
      {children}
      {isSorted === 'asc' ? (
        <ChevronUp className="ml-2 h-4 w-4" />
      ) : isSorted === 'desc' ? (
        <ChevronDown className="ml-2 h-4 w-4" />
      ) : (
        <ChevronsUpDown className="ml-2 h-4 w-4" />
      )}
    </Button>
  );
};

const columnHelper = createColumnHelper<Product>();

export const columns = [
  columnHelper.accessor('id', {
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => {
          table.toggleAllPageRowsSelected(!!value);
        }}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => {
          row.toggleSelected(!!value);
        }}
        aria-label="Select row"
      />
    ),
    enableHiding: false,
  }),
  columnHelper.accessor('name', {
    id: 'name',
    header: ({ column }) => <SortableHeader column={column}>{__('Product')}</SortableHeader>,
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="flex items-center gap-4">
          {product.image && (
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
              {product.sale_price &&
                product.sale_price !== product.regular_price && (
                  <div className="absolute right-1 top-1 rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    SALE
                  </div>
                )}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-gray-900">{product.name}</h3>
          </div>
        </div>
      );
    },
  }),
  columnHelper.accessor('sku', {
    id: 'sku',
    header: ({ column }) => <SortableHeader column={column}>{__('SKU')}</SortableHeader>,
    cell: ({ row }) => {
      const sku = row.getValue('sku') as string;
      return <span className="text-sm text-gray-600">{sku || '-'}</span>;
    },
  }),
  columnHelper.accessor('price', {
    id: 'price',
    header: ({ column }) => <SortableHeader column={column}>{__('Price')}</SortableHeader>,
    cell: ({ row }) => {
      const product = row.original;
      if (product.sale_price && product.sale_price !== product.regular_price) {
        const discount =
          ((parseFloat(product.regular_price) - parseFloat(product.sale_price)) /
            parseFloat(product.regular_price)) *
          100;
        return (
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-red-600">${product.sale_price}</span>
            <span className="text-sm font-medium text-gray-400 line-through">
              ${product.regular_price}
            </span>
            <span className="rounded-md bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
              {Math.round(discount)}% OFF
            </span>
          </div>
        );
      }
      return <span className="text-base font-bold text-gray-900">${product.price}</span>;
    },
  }),
  columnHelper.accessor('stock_status', {
    id: 'stock_status',
    header: ({ column }) => <SortableHeader column={column}>{__('Stock')}</SortableHeader>,
    cell: ({ row }) => {
      const product = row.original;
      return (
        <Badge
          variant={product.in_stock ? 'success' : 'destructive'}
          className="text-xs"
        >
          {product.in_stock ? __('In Stock') : __('Out of Stock')}
        </Badge>
      );
    },
  }),
  columnHelper.display({
    id: 'actions',
    header: __('Actions'),
    cell: ({ row }) => {
      const product = row.original;
      return (
       <Button variant="outline" size="sm">{__('Add to Cart')}</Button>
      );
    },
  }),
];

