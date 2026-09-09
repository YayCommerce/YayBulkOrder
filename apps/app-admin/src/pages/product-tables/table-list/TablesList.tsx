import { useMemo, useState } from 'react';
import { flexRender, getCoreRowModel, PaginationState, RowSelectionState, useReactTable } from '@tanstack/react-table';
import { ProductTableListParams } from '@yay-bulk-order/common/src/schemas/product-tables.schema';
import { Search, Trash2Icon } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useDebounce } from 'rooks';
import { toast } from 'sonner';
import { __, sprintf } from '@wordpress/i18n';

import { getErrorMsg } from '@/lib/helpers/response.helper';
import {
  useBulkDeleteProductTablesMutation,
  useIsMutatingBulkProductTables,
  useProductTablesQuery,
} from '@/lib/queries/product-table.queries';
import { cn } from '@/lib/utils';
import { BulkActionBox } from '@/components/ui/bulk-actions';
import { Button, LoadingButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Pagination } from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { HelpTip } from '@/components/ui/tooltip';
import { ProductTableColumns } from '@/pages/product-tables/table-list/TableColumns/TableColumns';

export default function ProductTablesList() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ProductTableListParams['productsDisplay']>('all-tables');
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [openBulkDelete, setOpenBulkDelete] = useState(false);
  const navigate = useNavigate();

  const setSearchDebounced = useDebounce(setSearch, 300);

  const queryParams: ProductTableListParams = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      perPage: pagination.pageSize,
      search,
      productsDisplay: filter,
    }),
    [pagination, search, filter],
  );

  const { data, isLoading, isFetching } = useProductTablesQuery(queryParams);
  const rows = useMemo(() => data?.data ?? [], [data]);

  const bulkDeleteMutation = useBulkDeleteProductTablesMutation();
  const isBulkMutating = useIsMutatingBulkProductTables();

  const table = useReactTable({
    data: rows,
    columns: ProductTableColumns,
    state: { pagination, rowSelection },
    getRowId: (row) => String(row.id),
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data?.totalPage ?? 0,
    rowCount: data?.totalItems ?? 0,
  });

  const selectedIds = table.getSelectedRowModel().rows.map((row) => row.original.id ?? 0);
  const selectedCount = selectedIds.length;
  const isEmpty = !isLoading && rows.length === 0;

  const handleBulkDelete = async () => {
    if (isBulkMutating) return;

    try {
      await bulkDeleteMutation.mutateAsync(selectedIds);
      table.resetRowSelection();
      setOpenBulkDelete(false);
      toast.success(sprintf(__('%d tables deleted', 'yay-bulk-order'), selectedCount));
    } catch (error) {
      toast.error(await getErrorMsg(error));
    }
  };

  return (
    <Card className="shadow-xs min-w-0 gap-4 p-4 md:p-5 2xl:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center justify-between gap-x-4 gap-y-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold">{__('Product Tables', 'yay-bulk-order')}</h1>
        </div>
        <div className="flex w-fit flex-col items-end justify-end gap-4 sm:flex-row">
          <InputGroup className="md:w-76 w-full">
            <InputGroupInput
              placeholder={__('Search by table title', 'yay-bulk-order')}
              defaultValue={search}
              onChange={(e) => {
                table.setPageIndex(0);
                setSearchDebounced(e.target.value);
              }}
            />
            <InputGroupAddon align="inline-end">
              <Search className="size-4.5 text-muted-foreground" />
            </InputGroupAddon>
          </InputGroup>
          <Select
            value={filter}
            onValueChange={(value) => {
              table.setPageIndex(0);
              setFilter(value as ProductTableListParams['productsDisplay']);
            }}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>{__('Tables Filter', 'yay-bulk-order')}</SelectLabel>
                <SelectItem value="all-tables">{__('All tables', 'yay-bulk-order')}</SelectItem>
                <SelectItem value="all-products">{__('All products', 'yay-bulk-order')}</SelectItem>
                <SelectItem value="by-categories">{__('Categories', 'yay-bulk-order')}</SelectItem>
                <SelectItem value="featured">{__('Featured products', 'yay-bulk-order')}</SelectItem>
                <SelectItem value="on-sale">{__('On sale products', 'yay-bulk-order')}</SelectItem>
                <SelectItem value="hand-picked">{__('Hand-picked products', 'yay-bulk-order')}</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button
            variant="primary-outline-fill"
            size="sm"
            className="h-9"
            onClick={() => {
              navigate('/product-tables/new');
            }}
          >
            {__('Build Product Table', 'yay-bulk-order')}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className={cn('relative w-full min-w-0 overflow-x-auto rounded-lg border', isFetching && 'opacity-60')}>
        <Table className="min-w-max">
          <TableHeader className="border-divider border-b">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      header.column.columnDef.meta?.align === 'center' ? 'text-center' : 'text-left',
                      header.column.columnDef.meta?.isCheckbox ? 'w-9' : 'px-3',
                    )}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={table.getAllColumns().length} className="h-32 text-center">
                  {__('Loading…', 'yay-bulk-order')}
                </TableCell>
              </TableRow>
            )}

            {isEmpty && (
              <TableRow>
                <TableCell colSpan={table.getAllColumns().length} className="h-32 text-center">
                  {__('No product tables found.', 'yay-bulk-order')}
                </TableCell>
              </TableRow>
            )}

            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(cell.column.columnDef.meta?.align === 'center' && 'text-center')}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="relative flex flex-col items-center gap-3 sm:flex-row">
        <BulkActionBox selected={selectedCount} onClose={() => table.resetRowSelection()}>
          <span>{sprintf(__('%d selected', 'yay-bulk-order'), selectedCount)}</span>
          <Separator orientation="vertical" className="h-5!" />
          <Dialog open={openBulkDelete} onOpenChange={setOpenBulkDelete}>
            <HelpTip
              trigger={
                <Button
                  size="icon"
                  variant="ghost"
                  className="hover:text-destructive text-muted-foreground size-8 hover:bg-transparent"
                  onClick={() => setOpenBulkDelete(true)}
                >
                  <Trash2Icon className="size-4" />
                </Button>
              }
              content={<span>{__('Delete', 'yay-bulk-order')}</span>}
            />
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{sprintf(__('Delete %d product tables?', 'yay-bulk-order'), selectedCount)}</DialogTitle>
                <DialogDescription>{__('This action cannot be undone.', 'yay-bulk-order')}</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">{__('Cancel', 'yay-bulk-order')}</Button>
                </DialogClose>
                <LoadingButton loading={bulkDeleteMutation.isPending} variant="destructive" onClick={handleBulkDelete}>
                  {__('Delete', 'yay-bulk-order')}
                </LoadingButton>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </BulkActionBox>

        <Pagination
          pageIndex={table.getState().pagination.pageIndex}
          pageCount={table.getPageCount()}
          onPreviousPage={() => table.previousPage()}
          onNextPage={() => table.nextPage()}
          onPageChange={(page) => table.setPageIndex(page)}
          canPreviousPage={table.getCanPreviousPage()}
          canNextPage={table.getCanNextPage()}
          className={cn('sm:ms-auto', table.getPageCount() === 0 && 'hidden')}
        />
      </div>
    </Card>
  );
}
