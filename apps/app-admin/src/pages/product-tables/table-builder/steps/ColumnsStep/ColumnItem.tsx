import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ProductTable, ProductTableColumn } from '@yay-bulk-order/common/src/schemas';
import { GripVerticalIcon, XIcon } from 'lucide-react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { __ } from '@wordpress/i18n';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { REQUIRED_PRODUCT_TABLE_COLS } from '@/pages/product-tables/table-builder/table-builder.helper';

type ColumnItemProps = {
  index: number;
  column: ProductTableColumn;
  onRemove: () => void;
};

export default function ColumnItem({ index, column, onRemove }: ColumnItemProps) {
  const isDefault = REQUIRED_PRODUCT_TABLE_COLS.includes(column.slug);

  const { control } = useFormContext<ProductTable>();
  const enabled = useWatch({ control, name: `columns.${index}.enabled` });

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column.slug,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }} // for dnd-kit
      className={cn(
        'bg-background border-border group gap-2.5 rounded-md border transition-shadow',
        isDragging && 'z-10 opacity-60 shadow-md',
        !isDragging && 'hover:shadow-xs',
      )}
    >
      <div className="flex items-center gap-2 px-3 py-2">
        <div
          {...attributes}
          {...listeners}
          className="text-muted-foreground hover:text-foreground flex h-9 w-3.5 cursor-grab items-center justify-center active:cursor-grabbing"
        >
          <GripVerticalIcon className="size-5" />
        </div>
        <Controller
          control={control}
          name={`columns.${index}.enabled`}
          render={({ field }) => (
            <Switch size="sm" checked={field.value} onCheckedChange={field.onChange} disabled={isDefault} />
          )}
        />
        <Badge variant="dimmed" className="shrink-0 font-mono text-xs">
          {column.slug}
        </Badge>
        {isDefault && (
          <span className="text-muted-foreground text-xs">{__('(always shown, cannot remove)', 'yay-bulk-order')}</span>
        )}
        <div className="flex-1" />
        {!isDefault && (
          <Button
            variant="link"
            onClick={onRemove}
            className="text-muted-foreground hover:text-destructive p-0! h-fit!"
          >
            <XIcon className="size-4" />
          </Button>
        )}
      </div>
      <div className={cn('grid grid-cols-2 gap-2 border-t px-3 py-2', !enabled && 'hidden')}>
        <Field className="gap-1">
          <FieldLabel className="font-normal">{__('Heading', 'yay-bulk-order')}</FieldLabel>
          <Controller
            control={control}
            name={`columns.${index}.heading`}
            render={({ field }) => (
              <Input {...field} placeholder={__('Column heading', 'yay-bulk-order')} className="h-8" />
            )}
          />
        </Field>
        <Field className="gap-1">
          <FieldLabel className="font-normal">{__('Responsive', 'yay-bulk-order')}</FieldLabel>
          <Controller
            control={control}
            name={`columns.${index}.responsive`}
            render={({ field }) => (
              <Select
                value={isDefault ? 'always-show' : field.value}
                disabled={isDefault}
                onValueChange={field.onChange}
              >
                <SelectTrigger size="sm" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="always-show">{__('Always show', 'yay-bulk-order')}</SelectItem>
                  <SelectItem value="hide-on-mobile">{__('Hide on mobile', 'yay-bulk-order')}</SelectItem>
                  <SelectItem value="hide-on-tablet">{__('Hide on tablet', 'yay-bulk-order')}</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </Field>
      </div>
    </div>
  );
}
