import { useState } from 'react';
import { HandbagIcon } from '@phosphor-icons/react';
import { ProductTable } from '@yay-bulk-order/common/src/schemas';
import {
  CodeXml,
  FilePlus,
  LayoutGrid,
  Loader2Icon,
  MoreHorizontalIcon,
  PanelsTopLeft,
  SquarePen,
  Trash2Icon,
} from 'lucide-react';
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
  useRemoveFromShopMutation,
  useShopProductTableIdQuery,
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
import { ConfirmDialog } from '@/components/custom/confirm-dialog';
import { makeBlockText, makeShortcodeWithId } from '@/pages/product-tables/product-tables.helper';

const { isBlockTheme, shopPageUrl } = window.yayBulkOrderMeta.wpMeta;

type ConfirmAction = 'delete' | 'applyToShop' | 'removeFromShop' | null;

export function ProductTableActions({ table }: { table: ProductTable }) {
  const navigate = useNavigate();
  const { copy } = useClipboard();
  const { cacheTable } = useCacheProductTable();
  const { data: shopTableId } = useShopProductTableIdQuery();
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  const createPatternMutation = useCreateProductTablePatternMutation(table.id);
  const stashPageBlocksMutation = useStashNewPageBlocksMutation();
  const applyToShopMutation = useApplyToShopMutation(table.id);
  const removeFromShopMutation = useRemoveFromShopMutation();
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
        await applyToShopMutation.mutateAsync();
        toast.success(__('Applied to Shop/Category page.', 'yay-bulk-order'));
        window.open(shopPageUrl);
      } catch (err) {
        console.error(err);
        toast.error(__('Could not apply the table to Shop/Category pages.', 'yay-bulk-order'));
      } finally {
        setConfirmAction(null);
      }
    }
  };

  const removeFromShop = async () => {
    if (isMutatingProductTable) return;

    if (!isBlockTheme) {
      try {
        await removeFromShopMutation.mutateAsync();
        toast.success(__('Removed from Shop/Category page.', 'yay-bulk-order'));
        window.open(shopPageUrl);
      } catch (err) {
        console.error(err);
        toast.error(__('Could not remove the table from Shop/Category pages.', 'yay-bulk-order'));
      } finally {
        setConfirmAction(null);
      }
    }
  };

  const confirmDelete = () => {
    deleteMutation.mutate(undefined, {
      onSettled: () => setConfirmAction(null),
    });
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
          <SquarePen className="size-4" />
          {__('Edit', 'yay-bulk-order')}
        </DropdownMenuItem>
        {isBlockTheme ? (
          <DropdownMenuItem onClick={openCatalogTemplateEditor}>
            <HandbagIcon className="size-4" />
            {__('Open Shop Template', 'yay-bulk-order')}
          </DropdownMenuItem>
        ) : shopTableId && Number(shopTableId) === table.id ? (
          <DropdownMenuItem
            disabled={removeFromShopMutation.isPending}
            onSelect={() => setConfirmAction('removeFromShop')}
          >
            {removeFromShopMutation.isPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <HandbagIcon className="size-4" />
            )}
            {__('Remove from Shop / Category', 'yay-bulk-order')}
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem disabled={applyToShopMutation.isPending} onSelect={() => setConfirmAction('applyToShop')}>
            {applyToShopMutation.isPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <HandbagIcon className="size-4" />
            )}
            {__('Use in Shop / Category', 'yay-bulk-order')}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem disabled={createPatternMutation.isPending} onClick={createTablePattern}>
          {createPatternMutation.isPending ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <LayoutGrid className="size-4" />
          )}
          {__('Create Pattern', 'yay-bulk-order')}
        </DropdownMenuItem>
        <DropdownMenuItem disabled={stashPageBlocksMutation.isPending} onClick={addNewPage}>
          {stashPageBlocksMutation.isPending ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <FilePlus className="size-4" />
          )}
          {__('Create with new page', 'yay-bulk-order')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={copyAsBlock}>
          <PanelsTopLeft className="size-4" />
          {__('Copy as Blocks', 'yay-bulk-order')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyAsShortcode}>
          <CodeXml className="size-4" />
          {__('Copy as Shortcode', 'yay-bulk-order')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={deleteMutation.isPending}
          onSelect={() => setConfirmAction('delete')}
        >
          {deleteMutation.isPending ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <Trash2Icon className="size-4" />
          )}
          {__('Delete', 'yay-bulk-order')}
        </DropdownMenuItem>
      </DropdownMenuContent>

      <ConfirmDialog
        open={confirmAction === 'delete'}
        onOpenChange={(open) => setConfirmAction(open ? 'delete' : null)}
        title={__('Delete this table?', 'yay-bulk-order')}
        description={__(
          'This action cannot be undone. This will permanently delete the product table.',
          'yay-bulk-order',
        )}
        confirmText={__('Delete', 'yay-bulk-order')}
        confirmVariant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={confirmDelete}
      />

      <ConfirmDialog
        open={confirmAction === 'applyToShop'}
        onOpenChange={(open) => setConfirmAction(open ? 'applyToShop' : null)}
        title={__('Use this table in Shop / Category?', 'yay-bulk-order')}
        description={__(
          'This will replace the current table used on the Shop/Category pages with this one.',
          'yay-bulk-order',
        )}
        confirmText={__('Use in Shop / Category', 'yay-bulk-order')}
        isLoading={applyToShopMutation.isPending}
        onConfirm={applyToShop}
      />

      <ConfirmDialog
        open={confirmAction === 'removeFromShop'}
        onOpenChange={(open) => setConfirmAction(open ? 'removeFromShop' : null)}
        title={__('Remove this table from Shop / Category?', 'yay-bulk-order')}
        description={__('The Shop/Category pages will no longer display this product table.', 'yay-bulk-order')}
        confirmText={__('Remove', 'yay-bulk-order')}
        confirmVariant="destructive"
        isLoading={removeFromShopMutation.isPending}
        onConfirm={removeFromShop}
      />
    </DropdownMenu>
  );
}
