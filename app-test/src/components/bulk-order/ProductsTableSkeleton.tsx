import { VisibilityState } from '@tanstack/react-table';

import { Skeleton } from '@/components/ui/skeleton';
import { TableCell, TableRow } from '@/components/ui/table';

interface ProductsTableSkeletonProps {
  rows?: number;
  columnVisibility?: VisibilityState;
}

export default function ProductsTableSkeleton({
  rows = 10,
  columnVisibility = {
    name: true,
    sku: true,
    price: true,
    stock_status: true,
    actions: true,
  },
}: ProductsTableSkeletonProps) {
  const columns = [
    { id: 'id', visible: true },
    { id: 'name', visible: columnVisibility.name },
    { id: 'sku', visible: columnVisibility.sku },
    { id: 'price', visible: columnVisibility.price },
    { id: 'stock_status', visible: columnVisibility.stock_status },
    { id: 'actions', visible: columnVisibility.actions },
  ].filter((column) => column.visible);

  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <TableRow key={index}>
          {columns.map((column) => (
            <TableCell key={column.id} className={`px-2 py-4 ${column.id === 'id' ? 'pr-0' : ''}`}>
              {column.id === 'id' && <Skeleton className="size-4.5 rounded-[4px]" />}
              {column.id === 'name' && (
                <div className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-lg" />
                  <Skeleton className="h-5 w-48" />
                </div>
              )}
              {column.id === 'sku' && <Skeleton className="h-4 w-24" />}
              {column.id === 'price' && <Skeleton className="h-5 w-20" />}
              {column.id === 'stock_status' && <Skeleton className="h-6 w-24 rounded-full" />}
              {column.id === 'actions' && <Skeleton className="h-8 w-20 rounded-lg" />}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

