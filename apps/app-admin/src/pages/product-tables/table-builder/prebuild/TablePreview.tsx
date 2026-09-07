import { TablePrebuildTemplate } from '@yay-bulk-order/common/src/schemas';

import { Skeleton } from '@/components/ui/skeleton';

export function TablePreview({ template }: { template: TablePrebuildTemplate['data'] }) {
  const { columns, features } = template;
  const showHeader = features.hasFilter || features.hasSearch;

  return (
    <div className="divide-border flex flex-col divide-y">
      {showHeader && (
        <div className="flex items-center gap-2 px-4 py-2.5">
          {features.hasFilter && (
            <>
              <Skeleton className="h-6 w-14 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </>
          )}
          {features.hasSearch && <Skeleton className="h-7 w-32 rounded-md" />}
          <Skeleton className="ml-auto h-7 w-20 rounded-md" />
        </div>
      )}

      <div className="bg-muted/30 grid" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
        {columns.map((col) => (
          <div key={col.slug} className="text-muted-foreground px-3 py-2 text-xs font-medium">
            {col.heading}
          </div>
        ))}
      </div>

      {[0, 1, 2].map((row) => (
        <div key={row} className="grid" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
          {columns.map((col) => (
            <div key={col.slug} className="flex items-center px-3 py-3">
              <ColumnSkeleton col={col.slug} />
            </div>
          ))}
        </div>
      ))}

      {features.hasPagination && (
        <div className="flex items-center justify-between px-4 py-3">
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-1">
            <Skeleton className="h-7 w-7 rounded-sm" />
            <Skeleton className="h-7 w-7 rounded-sm" />
            <Skeleton className="h-7 w-7 rounded-sm" />
            <Skeleton className="h-7 w-7 rounded-sm" />
          </div>
        </div>
      )}
    </div>
  );
}

function ColumnSkeleton({ col }: { col: string }) {
  switch (col) {
    case 'product':
      return (
        <div className="flex items-center gap-2">
          <Skeleton className="size-8 shrink-0 rounded-sm" />
          <Skeleton className="h-4 w-20" />
        </div>
      );
    case 'quantity':
      return (
        <div className="flex items-center gap-1">
          <Skeleton className="h-6 w-6 rounded-sm" />
          <Skeleton className="h-6 w-8" />
          <Skeleton className="h-6 w-6 rounded-sm" />
        </div>
      );
    case 'add-to-cart':
      return <Skeleton className="h-7 w-20 rounded-md" />;
    default:
      return <Skeleton className="h-4 w-14" />;
  }
}
