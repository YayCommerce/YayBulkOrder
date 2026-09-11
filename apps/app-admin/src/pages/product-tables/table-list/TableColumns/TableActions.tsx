import { ProductTable } from '@yay-bulk-order/common/src/schemas';
import { CirclePlus, Copy, MoreHorizontalIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useClipboard } from 'rooks';
import { toast } from 'sonner';
import { __ } from '@wordpress/i18n';

import {
  useApplyToShopMutation,
  useCacheProductTable,
  useDeleteProductTableMutation,
} from '@/lib/queries/product-table.queries';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { makeBlockText, makeShortcodeWithId } from '@/pages/product-tables/product-tables.helper';

const { isBlockTheme, shopPageUrl } = window.yayBulkOrderMeta.wpMeta;

export function ProductTableActions({ table }: { table: ProductTable }) {
  const navigate = useNavigate();
  const { copy } = useClipboard();
  const deleteMutation = useDeleteProductTableMutation(table.id ?? 0);
  const applyToShopMutation = useApplyToShopMutation();
  const { cacheTable } = useCacheProductTable();

  const applyToShop = async () => {
    try {
      await applyToShopMutation.mutateAsync(table.id);
      toast.success(__('Applied to Shop/Category page.', 'yay-bulk-order'));
      window.open(shopPageUrl);
    } catch (err) {
      console.error(err);
      toast.error(__('Could not apply the table to Shop/Category pages.', 'yay-bulk-order'));
    }
  };

  const copyAsBlock = async () => {
    try {
      await copy(makeBlockText(table, table.id));
      toast.success(__('Copied', 'yay-bulk-order'));
    } catch (err) {
      console.log(err);
      toast.error(__('Cannot Copy', 'yay-bulk-order'));
    }
  };

  const copyAsShortcode = async () => {
    try {
      await copy(makeShortcodeWithId(table.id));
      toast.success(__('Copied', 'yay-bulk-order'));
    } catch (err) {
      console.log(err);
      toast.error(__('Cannot Copy', 'yay-bulk-order'));
    }
  };

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
        <DropdownMenuItem disabled={applyToShopMutation.isPending} onClick={applyToShop}>
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
        <DropdownMenuItem onClick={copyAsBlock}>
          <Copy className="size-4" />
          {__('Copy as Blocks', 'yay-bulk-order')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyAsShortcode}>
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
