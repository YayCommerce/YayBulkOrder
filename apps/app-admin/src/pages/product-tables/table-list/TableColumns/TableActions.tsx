import { ProductTable } from '@yay-bulk-order/common/src/schemas';
import { CirclePlus, Copy, MoreHorizontalIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useClipboard } from 'rooks';
import { toast } from 'sonner';
import { __ } from '@wordpress/i18n';

import { archiveProductTemplateUrl, newPageUrl, patternEditUrl } from '@/lib/helpers/wp.helper';
import { useCreateProductTablePatternMutation, useIsMutatingPatterns } from '@/lib/queries/blocks.queries';
import {
  useApplyToShopMutation,
  useCacheProductTable,
  useDeleteProductTableMutation,
  useIsMutatingProductTables,
  useStashNewPageBlocksMutation,
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
  const { cacheTable } = useCacheProductTable();

  const createPatternMutation = useCreateProductTablePatternMutation(table.id);
  const stashPageBlocksMutation = useStashNewPageBlocksMutation();
  const applyToShopMutation = useApplyToShopMutation();
  const isMutatingPattern = useIsMutatingPatterns();
  const isMutatingProductTable = useIsMutatingProductTables();
  const deleteMutation = useDeleteProductTableMutation(table.id ?? 0);

  const createTablePattern = async () => {
    if (isMutatingPattern) return;
    try {
      const data = await createPatternMutation.mutateAsync({
        title: table.title,
        content: makeBlockText(table, table.id),
      });
      const patternId = data.id;

      toast.success(__('Pattern created successfully.', 'yay-bulk-order'));
      window.open(patternEditUrl(patternId));
    } catch (err) {
      console.error(err);
      toast.error(__('Cannot create this table pattern', 'yay-bulk-order'));
    }
  };

  const addNewPage = async () => {
    if (isMutatingProductTable) return;
    try {
      await stashPageBlocksMutation.mutateAsync(makeBlockText(table, table.id));
      window.open(newPageUrl());
    } catch (err) {
      console.error(err);
      toast.error(__('Could not open the page editor', 'yay-bulk-order'));
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

  const openCatalogTemplateEditor = () => {
    const url = archiveProductTemplateUrl();
    if (url) {
      window.open(url);
    }
  };

  const applyToShop = async () => {
    if (isMutatingProductTable) return;

    if (!isBlockTheme) {
      try {
        await applyToShopMutation.mutateAsync(table.id);
        toast.success(__('Applied to Shop/Category page.', 'yay-bulk-order'));
        window.yayBulkOrderAdminData.shopTableId = table.id;
        window.open(shopPageUrl);
      } catch (err) {
        console.error(err);
        toast.error(__('Could not apply the table to Shop/Category pages.', 'yay-bulk-order'));
      }
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
        {isBlockTheme ? (
          <DropdownMenuItem onClick={openCatalogTemplateEditor}>
            <PencilIcon className="size-4" />
            {__('Open Shop Template', 'yay-bulk-order')}
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem disabled={applyToShopMutation.isPending} onClick={applyToShop}>
            <PencilIcon className="size-4" />
            {__('Use in Shop / Category', 'yay-bulk-order')}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem disabled={createPatternMutation.isPending} onClick={createTablePattern}>
          <CirclePlus className="size-4" />
          {__('Create Pattern', 'yay-bulk-order')}
        </DropdownMenuItem>
        <DropdownMenuItem disabled={stashPageBlocksMutation.isPending} onClick={addNewPage}>
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
