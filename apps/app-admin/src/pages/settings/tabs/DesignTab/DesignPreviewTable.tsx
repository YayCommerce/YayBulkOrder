import { ComponentProps, CSSProperties } from 'react';
import { Settings } from '@yay-bulk-order/common/src/schemas';
import { Image } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { __ } from '@wordpress/i18n';

import { parseWCCurrency } from '@/lib/helpers/format.helper';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const products = [
  { name: __('Product A', 'yay-bulk-order'), sku: 'SKU-001', price: 1000 },
  { name: __('Product B', 'yay-bulk-order'), sku: 'SKU-002', price: 150 },
  { name: __('Product C', 'yay-bulk-order'), sku: 'SKU-003', badge: 3, price: 200 },
];

function PreviewTableHeader({ className, ...props }: ComponentProps<'th'>) {
  return <th className={cn('border-b border-t-0 px-3.5 py-4 font-medium', className)} {...props} />;
}

function PreviewTableCell({ className, ...props }: ComponentProps<'td'>) {
  return <td className={cn('border-b px-3.5 py-4', className)} {...props} />;
}

export function DesignPreviewTable() {
  const { watch } = useFormContext<Settings>();
  const cellStyle = { borderColor: watch('colors.border') };

  return (
    <div className="w-217 overflow-auto rounded-md border" style={cellStyle}>
      <table
        className="w-full table-auto border-collapse overflow-hidden text-left text-sm"
        style={{ background: watch('colors.background'), color: watch('colors.text') }}
      >
        <thead>
          <tr className="border-b" style={cellStyle}>
            <PreviewTableHeader style={cellStyle}>{__('Product', 'yay-bulk-order')}</PreviewTableHeader>
            <PreviewTableHeader style={cellStyle}>{__('Description', 'yay-bulk-order')}</PreviewTableHeader>
            <PreviewTableHeader style={cellStyle}>{__('SKU', 'yay-bulk-order')}</PreviewTableHeader>
            <PreviewTableHeader style={cellStyle}>{__('Quantity', 'yay-bulk-order')}</PreviewTableHeader>
            <PreviewTableHeader style={cellStyle}>{__('Subtotal', 'yay-bulk-order')}</PreviewTableHeader>
            <PreviewTableHeader style={cellStyle}>{__('Add to Cart', 'yay-bulk-order')}</PreviewTableHeader>
            <PreviewTableHeader style={cellStyle} />
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.sku} className="border-b" style={cellStyle}>
              <PreviewTableCell className="flex items-center gap-2 border-0" style={cellStyle}>
                <div className="relative">
                  <div className="bg-muted text-muted-foreground flex h-10 w-10 items-center justify-center rounded-md">
                    <Image className="size-5" />
                  </div>
                  {product.badge && (
                    <Badge
                      className="absolute -left-2 -top-2 p-1.5 text-[10px]"
                      style={{ background: watch('colors.primary') }}
                    >
                      {product.badge}
                    </Badge>
                  )}
                </div>
                <div
                  className="hover:text-(--ybo-preview-text-hover)"
                  style={{ '--ybo-preview-text-hover': watch('colors.textHover') } as CSSProperties}
                >
                  {product.name}
                </div>
              </PreviewTableCell>
              <PreviewTableCell style={{ ...cellStyle, color: watch('colors.description') }}>
                {__('Product description', 'yay-bulk-order')}
              </PreviewTableCell>
              <PreviewTableCell style={cellStyle}>{product.sku}</PreviewTableCell>
              <PreviewTableCell style={cellStyle}>
                <input
                  disabled
                  type="number"
                  value={watch('general.defaultCartQuantity')}
                  readOnly
                  className="h-6 w-12 rounded-md bg-white py-4 text-xs"
                  style={{
                    background: watch('colors.background'),
                    color: watch('colors.text'),
                    borderColor: watch('colors.border'),
                  }}
                />
              </PreviewTableCell>
              <PreviewTableCell style={cellStyle}>{parseWCCurrency(product.price)}</PreviewTableCell>
              <PreviewTableCell style={cellStyle}>
                <Button
                  className="bg-(--ybo-preview-button-background) text-(--ybo-preview-button-text) hover:bg-(--ybo-preview-button-background-hover) hover:text-(--ybo-preview-button-text-hover) rounded-xs px-3 py-1.5 text-xs font-medium"
                  style={
                    {
                      '--ybo-preview-button-background': watch('colors.buttonBackground'),
                      '--ybo-preview-button-text': watch('colors.buttonText'),
                      '--ybo-preview-button-background-hover': watch('colors.buttonBackgroundHover'),
                      '--ybo-preview-button-text-hover': watch('colors.buttonTextHover'),
                    } as CSSProperties
                  }
                >
                  {__('Add to cart', 'yay-bulk-order')}
                </Button>
              </PreviewTableCell>
              <PreviewTableCell className="text-center" style={cellStyle}>
                <input type="checkbox" className="rounded-xs size-5 bg-white" />
              </PreviewTableCell>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
