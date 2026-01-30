import {
  closestCenter,
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { __ } from '@wordpress/i18n';

import { ColumnId } from '@/lib/schemas/shortcodes.schema';
import { Button } from '@/components/ui/button';

type Props = {
  value: ColumnId[];
  onValueChange: (value: ColumnId[]) => void;
};

export function ColumnOrder({ value, onValueChange }: Props) {
  const sensors = useSensors(useSensor(MouseSensor, {}), useSensor(TouchSensor, {}));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const oldIndex = value.indexOf(active.id as ColumnId);
      const newIndex = value.indexOf(over.id as ColumnId);
      const newValue = arrayMove(value, oldIndex, newIndex);
      onValueChange(newValue);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <DndContext
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <SortableContext items={value} strategy={verticalListSortingStrategy}>
          {value.map((columnId) => (
            <DraggableButton key={columnId} id={columnId} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}

function DraggableButton({ id }: { id: ColumnId }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform), //let dnd-kit do its thing
    transition: transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1 : 0,
    position: 'relative',
  } satisfies React.CSSProperties;

  return (
    <Button
      variant="outline"
      className="w-40 cursor-grab justify-start"
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="text-sm whitespace-nowrap">{COLUMN_LABELS[id]}</span>
    </Button>
  );
}

const COLUMN_LABELS: Record<string, string> = {
  'yay-bulk-order/column-product-title': __('Title', 'yay-bulk-order'),
  'yay-bulk-order/column-product-price': __('Price', 'yay-bulk-order'),
  'yay-bulk-order/column-product-stock': __('Stock', 'yay-bulk-order'),
  'yay-bulk-order/column-add-to-cart': __('Cart', 'yay-bulk-order'),
};
