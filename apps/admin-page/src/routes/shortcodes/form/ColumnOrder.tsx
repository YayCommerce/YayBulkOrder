import { useState } from 'react';
import {
  closestCenter,
  DndContext,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { __ } from '@wordpress/i18n';

import { ColumnId, ShortcodeConfigFormValues } from '@/lib/schemas/shortcodes.schema';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';

export function ColumnOrder() {
  const form = useFormContext<ShortcodeConfigFormValues>();
  const columns = form.watch('columns');

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const getIndex = (id: UniqueIdentifier) => form.getValues('columns').indexOf(id as ColumnId);
  const activeIndex = activeId != null ? getIndex(activeId) : -1;
  const sensors = useSensors(useSensor(MouseSensor, {}), useSensor(TouchSensor, {}));

  function onDragStart({ active }: DragStartEvent) {
    if (!active) return;
    setActiveId(active.id);
  }
  function onDragCancel() {
    setActiveId(null);
  }

  function handleDragEnd({ over }: DragEndEvent) {
    setActiveId(null);
    if (!over) return;
    const overIndex = getIndex(over.id);
    if (overIndex === activeIndex) return;

    const currentColumns = form.getValues('columns');
    const newCols = arrayMove(currentColumns, activeIndex, overIndex);
    form.setValue('columns', newCols, { shouldDirty: true, shouldTouch: true });
  }

  return (
    <Field>
      <FieldLabel>{__('Column Order', 'yay-bulk-order')}</FieldLabel>
      <input type="hidden" {...form.register('columns')} />
      <div>
        <DndContext
          collisionDetection={closestCenter}
          onDragStart={onDragStart}
          onDragCancel={onDragCancel}
          onDragEnd={handleDragEnd}
          sensors={sensors}
        >
          <SortableContext items={columns} strategy={verticalListSortingStrategy}>
            <div className="flex w-40 flex-col items-stretch justify-stretch gap-2">
              {columns.map((columnId) => (
                <DraggableButton key={columnId} columnId={columnId} />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeId != null ? (
              <div className="z-50 flex w-40">
                <Button variant="outline" className="w-full cursor-grab justify-start hover:bg-background">
                  <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-sm whitespace-nowrap">{COLUMN_LABELS[activeId]}</span>
                </Button>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </Field>
  );
}

function DraggableButton({ columnId }: { columnId: ColumnId }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: columnId,
  });

  const style = {
    transform: CSS.Transform.toString(transform), //let dnd-kit do its thing
    transition: transition,
    position: 'relative',
  } satisfies React.CSSProperties;

  return (
    <div
      ref={setNodeRef}
      className={cn(isDragging && 'rounded-sm bg-muted')}
      style={style}
      {...attributes}
      {...listeners}
    >
      <Button variant="outline" className={cn('w-full cursor-grab justify-start', isDragging && 'invisible')}>
        <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="text-sm whitespace-nowrap">{COLUMN_LABELS[columnId]}</span>
      </Button>
    </div>
  );
}

const COLUMN_LABELS: Record<string, string> = {
  'yay-bulk-order/column-product-title': __('Title', 'yay-bulk-order'),
  'yay-bulk-order/column-product-price': __('Price', 'yay-bulk-order'),
  'yay-bulk-order/column-product-stock': __('Stock', 'yay-bulk-order'),
  'yay-bulk-order/column-add-to-cart': __('Cart', 'yay-bulk-order'),
};
