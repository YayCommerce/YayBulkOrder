import { ProductTable } from '@yay-bulk-order/common/src/schemas';
import { CirclePlus, Copy, MoreHorizontalIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { useNavigate } from 'react-router';
import { __ } from '@wordpress/i18n';

import { useCacheProductTable, useDeleteProductTableMutation } from '@/lib/queries/product-table.queries';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ProductTableActions({ table }: { table: ProductTable }) {
  const navigate = useNavigate();
  const deleteMutation = useDeleteProductTableMutation(table.id ?? 0);
  const { cacheTable } = useCacheProductTable();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <MoreHorizontalIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => {
            cacheTable(table);
            navigate(`/product-tables/edit/${table.id}`);
          }}
        >
          <PencilIcon className="size-4" />
          {__('Edit', 'yay-bulk-order')}
        </DropdownMenuItem>
        <DropdownMenuItem>
          <PencilIcon className="size-4" />
          {__('Use in Shop / Category', 'yay-bulk-order')}
        </DropdownMenuItem>
        <DropdownMenuItem>
          <CirclePlus className="size-4" />
          {__('Create Pattern', 'yay-bulk-order')}
        </DropdownMenuItem>
        <DropdownMenuItem>
          <CirclePlus className="size-4" />
          {__('Create with new page', 'yay-bulk-order')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Copy className="size-4" />
          {__('Copy as Blocks', 'yay-bulk-order')}
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Copy className="size-4" />
          {__('Copy as Shortcode', 'yay-bulk-order')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={deleteMutation.isPending}
          onSelect={() => deleteMutation.mutate()}
        >
          <Trash2Icon className="size-4" />
          {__('Delete', 'yay-bulk-order')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
