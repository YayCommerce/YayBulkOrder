import { useState } from 'react';
import { GripVertical } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { __ } from '@wordpress/i18n';

import { ShortcodeFormValues } from '@/lib/schemas/shortcodes.schema';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';

const COLUMN_LABELS: Record<string, string> = {
  'yay-bulk-order/column-product-title': __('Title', 'yay-bulk-order'),
  'yay-bulk-order/column-product-price': __('Price', 'yay-bulk-order'),
  'yay-bulk-order/column-product-stock': __('Stock', 'yay-bulk-order'),
  'yay-bulk-order/column-add-to-cart': __('Cart', 'yay-bulk-order'),
};

export function ColumnOrder() {
  const { control, watch } = useFormContext<ShortcodeFormValues>();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // TypeScript has issues inferring the field array type with zod schemas
  // This is a known limitation - the runtime behavior is correct
  const { fields, move } = useFieldArray({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: control as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    name: 'columns' as any,
  });

  // Watch the current column order values
  const columnOrderValues = watch('columns');

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      move(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <FormField
      control={control}
      name="columns"
      render={() => (
        <FormItem className="w-full gap-2.5">
          <FormLabel className="text-foreground-400 text-xs font-medium">
            {__('Column Order', 'yay-bulk-order')}
          </FormLabel>
          <FormControl>
            <div className="flex flex-nowrap gap-2">
              {fields.map((field, index) => {
                // Get the actual value from the watched array
                const value = columnOrderValues?.[index] || String(field);
                const isDragging = draggedIndex === index;
                const isDragOver = dragOverIndex === index;

                return (
                  <div
                    key={field.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`flex shrink-0 cursor-move items-center gap-2 rounded-md border px-3 py-2 transition-all ${isDragging ? 'bg-muted opacity-50' : ''} ${isDragOver ? 'border-primary bg-primary/5' : 'border-border bg-background'} hover:border-primary/50 hover:bg-muted/50`}
                  >
                    <GripVertical className="text-muted-foreground h-4 w-4 shrink-0" />
                    <span className="text-sm font-medium whitespace-nowrap">
                      {COLUMN_LABELS[value] || value}
                    </span>
                  </div>
                );
              })}
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );
}
