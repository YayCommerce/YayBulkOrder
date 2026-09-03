import { useMemo, useState } from 'react';
import { closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ProductTable, ProductTableColumn } from '@yay-bulk-order/common/src/schemas';
import { Plus } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { __ } from '@wordpress/i18n';

import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import ColumnItem from '@/pages/product-tables/table-builder/steps/ColumnsStep/ColumnItem';
import { ALL_PRODUCT_TABLE_COLS, BuilderStepsProps } from '@/pages/product-tables/table-builder/table-builder.helper';

export default function ColumnsStep({ setSteps }: BuilderStepsProps) {
  const [addPopoverOpen, setAddPopoverOpen] = useState(false);
  const [addPending, setAddPending] = useState<ProductTableColumn['slug'][]>([]);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const { control } = useFormContext<ProductTable>();
  const { fields, append, remove, move } = useFieldArray({ control, name: 'columns' });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = fields.findIndex((f) => f.slug === active.id);
    const newIndex = fields.findIndex((f) => f.slug === over.id);
    if (oldIndex !== -1 && newIndex !== -1) move(oldIndex, newIndex);
  };

  const togglePendingAdd = (slug: ProductTableColumn['slug']) => {
    setAddPending((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  };

  const addColumns = () => {
    const newCols = ALL_PRODUCT_TABLE_COLS.filter((col) => addPending.includes(col.slug));
    append(newCols);
    setAddPopoverOpen(false);
  };

  const availableToAdd = useMemo(
    () => ALL_PRODUCT_TABLE_COLS.filter((col) => !fields.map((formCol) => formCol.slug).includes(col.slug)),
    [fields],
  );

  return (
    <Card className="w-2xl max-h-[calc(100vh-150px)] max-w-2xl overflow-y-auto">
      <CardHeader>
        <CardTitle className="text-base font-medium">{__('Configure table columns', 'yay-bulk-order')}</CardTitle>
        <CardDescription>{__('Add, reorder, and customize each column.', 'yay-bulk-order')}</CardDescription>
      </CardHeader>

      <div className="flex flex-col gap-2">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={fields.map((f) => f.slug)} strategy={verticalListSortingStrategy}>
            {fields.map((col, index) => (
              <ColumnItem key={col.id} index={index} column={col} onRemove={() => remove(index)} />
            ))}
          </SortableContext>
        </DndContext>

        {availableToAdd.length > 0 && (
          <Popover
            open={addPopoverOpen}
            onOpenChange={(open) => {
              setAddPopoverOpen(open);
              if (!open) setAddPending([]);
            }}
          >
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="flex w-fit items-center gap-1">
                <Plus /> {__('Add Columns', 'yay-bulk-order')}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-52 p-3">
              <p className="mb-2 text-xs font-medium">{__('Add columns', 'yay-bulk-order')}</p>
              <div className="flex flex-col gap-1.5">
                {availableToAdd.map((col, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Checkbox
                      id={`add-${col.slug}`}
                      checked={addPending.includes(col.slug)}
                      onCheckedChange={() => togglePendingAdd(col.slug)}
                    />
                    <Label className="font-normal" htmlFor={`add-${col.slug}`}>
                      {col.heading}
                    </Label>
                  </div>
                ))}
              </div>
              <Button size="sm" className="mt-3 w-full" disabled={addPending.length === 0} onClick={addColumns}>
                {__('Add', 'yay-bulk-order')}
              </Button>
            </PopoverContent>
          </Popover>
        )}
      </div>

      <div className="flex items-center justify-center gap-4 border-t pt-6">
        <Button variant="outline" size="sm" onClick={() => setSteps('products')}>
          {__('Back', 'yay-bulk-order')}
        </Button>
        <Button variant="primary" size="sm" onClick={() => setSteps('features')}>
          {__('Next', 'yay-bulk-order')}
        </Button>
      </div>
    </Card>
  );
}
