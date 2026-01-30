import { ColumnDef } from '@tanstack/react-table';
import { __ } from '@wordpress/i18n';

import { ShortcodeConfig } from '@/lib/schemas/shortcodes.schema';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ShortcodeActionColumn } from './ShortcodeActionColumn';
import { ShortcodeTitleColumn } from './ShortcodeTitleColumn';

export const shortcodeColumns: ColumnDef<ShortcodeConfig>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Label htmlFor="select-all" className="flex h-full w-full cursor-pointer items-center justify-center px-4">
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
        <Label htmlFor={id} className="flex h-full w-full cursor-pointer items-center justify-center px-4">
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
      return <ShortcodeTitleColumn shortcodeConfig={row.original} />;
    },
  },
  {
    id: 'shortcode',
    accessorKey: 'shortcode',
    header: __('Shortcode', 'yay-bulk-order'),
    cell: ({ row }) => {
      return <div className="flex items-center gap-2">[ybo-form-shortcode id="{row.original.id}"]</div>;
    },
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      return <ShortcodeActionColumn shortcodeConfig={row.original} />;
    },
  },
];
