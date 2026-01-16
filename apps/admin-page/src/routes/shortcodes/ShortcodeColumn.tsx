import { ColumnDef } from '@tanstack/react-table';
import { __ } from '@wordpress/i18n';
import { Bolt, TrashIcon } from 'lucide-react';

import { ShortcodeFormValues } from '@/lib/schemas/shortcodes.schema';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CopyButton } from '@/components/ui/copy-button';
import { Label } from '@/components/ui/label';

interface ColumnActions {
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export const ShortcodeColumn: (actions: ColumnActions) => ColumnDef<ShortcodeFormValues>[] = (
  actions,
) => [
  {
    id: 'select',
    header: ({ table }) => (
      <Label
        htmlFor="select-all"
        className="flex h-full w-full cursor-pointer items-center justify-center px-4"
      >
        <Checkbox
          id="select-all"
          className="size-4 bg-white"
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </Label>
    ),
    cell: ({ row }) => {
      const id = `select-${row.original.id}`;

      return (
        <Label
          htmlFor={id}
          className="flex h-full w-full cursor-pointer items-center justify-center px-4"
        >
          <Checkbox
            id={id}
            className="pointer-events-none size-4 bg-white"
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </Label>
      );
    },
    meta: { align: 'center', isCheckbox: true },
    size: 36,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'title',
    header: __('Title', 'yay-bulk-order'),
    cell: ({ row }) => {
      return <div>{row.original.title}</div>;
    },
  },
  {
    id: 'shortcode',
    accessorKey: 'shortcode',
    header: __('Shortcode', 'yay-bulk-order'),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          [yay_bulk_order_shortcode id="{row.original.id}"]
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      return (
        <div className="flex w-10 items-center justify-end gap-2">
          <CopyButton content={`[yay_bulk_order_shortcode id="${row.original.id}"]`} />

          <Button variant="outline" size="icon" onClick={() => actions.onEdit(row.original.id)}>
            <Bolt className="size-4" />
          </Button>

          <Button variant="outline" size="icon" onClick={() => actions.onDelete(row.original.id)}>
            <TrashIcon className="size-4" />
          </Button>
        </div>
      );
    },
  },
];
