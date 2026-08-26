import { __ } from '@wordpress/i18n';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const headerCellClass = 'border border-t-0 px-2.5 py-2 font-medium';
const cellClass = 'border px-2.5 py-2 align-middle';

const products = [
  { name: __('Product A', 'yay-bulk-order'), sku: 'SKU-001' },
  { name: __('Product B', 'yay-bulk-order'), sku: 'SKU-002' },
  { name: __('Product C', 'yay-bulk-order'), sku: 'SKU-003', badge: 3 },
];

export function DesignPreviewTable() {
  return (
    <div className="w-217 overflow-auto rounded-md border">
      <table className="w-full table-auto border-collapse overflow-hidden text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className={headerCellClass}>{__('Product', 'yay-bulk-order')}</th>
            <th className={headerCellClass}>{__('Description', 'yay-bulk-order')}</th>
            <th className={headerCellClass}>{__('SKU', 'yay-bulk-order')}</th>
            <th className={headerCellClass}>{__('Quantity', 'yay-bulk-order')}</th>
            <th className={headerCellClass}>{__('Subtotal', 'yay-bulk-order')}</th>
            <th className={headerCellClass}>{__('Add to Cart', 'yay-bulk-order')}</th>
            <th className={headerCellClass}></th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.sku} className="border-b">
              <td className={cn(cellClass, 'flex flex-col items-center justify-center gap-1 border-0 py-3.5')}>
                <div className="relative">
                  <Skeleton className="h-10 w-10 rounded-md" />
                  {product.badge && (
                    <Badge className="absolute -left-2 -top-2 p-1.5 text-[10px]">{product.badge}</Badge>
                  )}
                </div>
                <div>{product.name}</div>
              </td>
              <td className={cellClass}>{__('Product description', 'yay-bulk-order')}</td>
              <td className={cellClass}>{product.sku}</td>
              <td className={cellClass}>
                <input disabled type="number" value={1} readOnly className="h-6 w-12 text-xs" />
              </td>
              <td className={cellClass}>0,00 kr.</td>
              <td className={cellClass}>
                <button
                  type="button"
                  className="bg-primary text-primary-foreground rounded px-3 py-1.5 text-xs font-medium"
                >
                  {__('Add to cart', 'yay-bulk-order')}
                </button>
              </td>
              <td className={cn(cellClass, 'text-center')}>
                <input type="checkbox" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
