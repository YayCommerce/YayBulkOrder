import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { flexRender, getCoreRowModel, PaginationState, useReactTable } from '@tanstack/react-table';
import { debounce } from 'lodash';
import { ChevronLeft, ChevronRight, Plus, Search, TrashIcon } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Spinner } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';

import {
  useBulkDeleteShortcodeMutation,
  useDeleteShortcodeMutation,
  useShortcodesQuery,
} from '@/lib/queries/shortcodes.queries';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import BulkActionBox from '@/components/ui/bulk-actions-box';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { NumberInput } from '@/components/ui/number-input';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ShortcodeColumn } from './ShortcodeColumn';

export default function ShortcodeList() {
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [search, setSearch] = useState('');
  const [openBulkDeleteDialog, setOpenBulkDeleteDialog] = useState(false);
  const queryClient = useQueryClient();

  const debouncedSearch = useMemo(() => {
    return debounce((value) => {
      setKeyword(value);
    }, 500);
  }, [queryClient]);

  const {
    data,
    isLoading: isLoadingShortcodes,
    isFetching: isFetchingShortcodes,
  } = useShortcodesQuery(keyword, pagination);

  const { mutate: deleteShortcode } = useDeleteShortcodeMutation();

  const columns = useMemo(
    () =>
      ShortcodeColumn({
        onEdit: (id) => navigate(`/shortcodes/${id}`),
        onDelete: (id) => {
          if (!window.confirm('Are you sure you want to delete this shortcode?')) {
            return;
          }
          deleteShortcode(id);
        },
      }),
    [navigate],
  );

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    state: {
      pagination,
    },
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: setPagination,
    manualPagination: true,
    pageCount: data?.totalPage ?? 0,
    rowCount: data?.data.length ?? 0,
  });

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const selectedRowsIds = useMemo(
    () => Array.from(table.getSelectedRowModel().rows, (row) => row.original.id),
    [selectedCount],
  );

  const { mutateAsync: bulkDeleteShortcodes, isPending: isBulkDeleteShortcodesPending } =
    useBulkDeleteShortcodeMutation(selectedRowsIds);

  const handleChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    table.setPageIndex(0);
    debouncedSearch(e.target.value);
  };

  const handleBulkDeleteShortcodes = async () => {
    await bulkDeleteShortcodes();
    setOpenBulkDeleteDialog(false);
    table.resetRowSelection();
  };

  return (
    <Card className="gap-4 rounded-lg p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-nowrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{__('Shortcodes', 'yay-bulk-order')}</h1>
        </div>
        <div className="flex flex-col items-end gap-4 md:flex-row">
          {(table.getPageCount() > 1 || keyword !== '') && (
            <InputGroup className="w-full md:w-76">
              <InputGroupInput placeholder="Search" value={search} onChange={handleChangeSearch} />
              <InputGroupAddon align="inline-end">
                <Search className="size-4.5 text-[#A0A0A7]" />
              </InputGroupAddon>
            </InputGroup>
          )}

          <Button
            variant="primary-outline"
            className="hover:bg-primary hover:text-primary-foreground gap-2 rounded-sm px-4 text-sm font-medium shadow-xs"
            onClick={() => navigate('/shortcodes/new')}
          >
            <Plus className="h-4 w-4" />
            {__('Add New Shortcode', 'yay-bulk-order')}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div
        className={cn(
          'relative overflow-x-auto rounded-lg border',
          isBulkDeleteShortcodesPending && 'relative opacity-50',
        )}
      >
        {/* Overlay Spinner */}
        {isBulkDeleteShortcodesPending && (
          <div className="absolute inset-0 z-50 flex items-center justify-center">
            <Spinner className="text-muted-foreground size-6 animate-spin" />
          </div>
        )}
        <Table className="min-w-full">
          <TableHeader className="text-foreground bg-muted-400 h-[46px]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-border border-b">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      'text-foreground-400 py-2 text-left text-sm font-medium',
                      header.column.columnDef.meta?.isCheckbox ? 'w-[36px] p-0' : 'px-3',
                    )}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoadingShortcodes ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center align-middle">
                  <div className="flex items-center justify-center gap-2">
                    <Spinner className="text-muted-foreground size-6 animate-spin" />
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="group not-last:border-border not-last:border-b"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'h-14',
                        cell.column.id === 'select' ? 'p-0' : '',
                        cell.column.id === 'actions' ? 'flex w-25 justify-end lg:w-full' : '',
                      )}
                      onClick={() => {
                        if (['select', 'actions'].indexOf(cell.column.id) < 0) {
                          queryClient.setQueryData(['shortcode', row.original.id], row.original);
                          navigate(`/shortcodes/${row.original.id}`);
                        }
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {__('No shortcodes found.', 'yay-bulk-order')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Footer */}
      {(table.getPageCount() > 1 || selectedCount > 1) && (
        <div
          className={cn(
            'relative flex flex-col items-center gap-3 sm:flex-row',
            selectedCount > 1 && !isBulkDeleteShortcodesPending ? 'justify-between' : 'justify-end',
          )}
        >
          {!isBulkDeleteShortcodesPending && (
            <BulkActionBox selected={selectedCount} onClose={() => table.resetRowSelection()}>
              <span className="text-foreground text-sm font-normal">
                {sprintf(__('%d selected', 'yay-bulk-order'), selectedCount)}
              </span>
              <Separator orientation="vertical" className="ml-2 h-5!" />

              <AlertDialog open={openBulkDeleteDialog} onOpenChange={setOpenBulkDeleteDialog}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:text-destructive text-muted-foreground h-8 w-8 shrink-0 hover:bg-transparent hover:shadow-sm"
                  onClick={() => setOpenBulkDeleteDialog(true)}
                  aria-label="Delete selected"
                >
                  <TrashIcon className="size-4" />
                </Button>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {sprintf(
                        __(`Are you sure you want to delete %d shortcodes ?`, 'yay-bulk-order'),
                        selectedCount,
                      )}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {__(
                        'This action cannot be undone. This will permanently delete these request and remove data from servers',
                        'yay-bulk-order',
                      )}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{__('Cancel', 'yay-bulk-order')}</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/80"
                      onClick={handleBulkDeleteShortcodes}
                    >
                      {__('Continue', 'yay-bulk-order')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </BulkActionBox>
          )}
          {/* Right side - Pagination controls */}
          {table.getPageCount() > 1 && (
            <div className="flex items-center gap-4">
              <span className="text-foreground-400 text-sm font-normal">
                {sprintf(
                  __('Page %d of %d', 'yay-bulk-order'),
                  table.getState().pagination.pageIndex + 1,
                  table.getPageCount(),
                )}
              </span>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-foreground-400 text-sm font-normal">
                  {__('Go to', 'yay-bulk-order')}
                </span>
                <NumberInput
                  min={1}
                  max={table.getPageCount()}
                  value={table.getState().pagination.pageIndex + 1}
                  onValueChange={(value) => {
                    if (isFetchingShortcodes) return;
                    const page = value ? Number(value) - 1 : 0;
                    if (page >= 0 && page < table.getPageCount()) {
                      table.setPageIndex(page);
                    }
                  }}
                  className="text-foreground-400 h-9 w-15 rounded-sm text-sm font-normal focus-visible:ring-0"
                  disabled={isFetchingShortcodes || table.getPageCount() <= 1}
                ></NumberInput>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
