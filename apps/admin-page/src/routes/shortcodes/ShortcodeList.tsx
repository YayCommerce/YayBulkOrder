import { useMemo, useState } from 'react';
import { CaretUpDownIcon } from '@phosphor-icons/react';
import { flexRender, getCoreRowModel, PaginationState, RowSelectionState, useReactTable } from '@tanstack/react-table';
import { useDebounce } from 'ahooks';
import { Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router';
import { __ } from '@wordpress/i18n';

import { useShortcodesQuery } from '@/lib/queries/shortcodes.queries';
import { BulkActionBox } from '@/components/ui/bulk-actions';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Pagination } from '@/components/ui/pagination';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { shortcodeColumns } from './list/ShortcodeColumn';

export default function ShortcodeList() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const debouncedKeyword = useDebounce(keyword, { wait: 300 });
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data: shortcodes, isLoading: isLoadingShortcodes } = useShortcodesQuery(debouncedKeyword, pagination);

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const defaultData = useMemo(() => [], []);

  const table = useReactTable({
    data: shortcodes?.data ?? defaultData,
    getRowId: (row) => String(row.id),
    columns: shortcodeColumns,
    state: {
      pagination,
      rowSelection,
    },
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    manualPagination: true,
    enableRowSelection: true,
    pageCount: shortcodes?.totalPage ?? 0,
    rowCount: shortcodes?.data.length ?? 0,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{__('Shortcodes Configuration', 'yay-bulk-order')}</CardTitle>
      </CardHeader>

      <div className="flex flex-col items-end gap-4 md:flex-row">
        <InputGroup className="w-full md:w-76">
          <InputGroupInput placeholder="Search" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
          <InputGroupAddon align="inline-end">
            <Search className="size-4.5 text-[#A0A0A7]" />
          </InputGroupAddon>
        </InputGroup>

        <Button
          variant="primary-outline"
          className="ms-auto gap-2 rounded-sm px-4 text-sm font-medium shadow-xs hover:bg-primary hover:text-primary-foreground"
          onClick={() => navigate('/shortcodes/new')}
        >
          <Plus className="h-4 w-4" />
          {__('Add New Shortcode', 'yay-bulk-order')}
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className={header.id === 'select' || header.id === 'actions' ? 'w-9' : ''}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={999} className="h-24 text-center">
                  {isLoadingShortcodes ? 'Loading...' : 'No results.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="relative flex flex-col items-center gap-3 sm:flex-row">
        <BulkActionBox selected={Object.keys(rowSelection).length} onClose={() => table.resetRowSelection()}>
          <span>{Object.keys(rowSelection).length} selected</span>
          <Separator orientation="vertical" className="ml-2 h-5!" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="group flex cursor-pointer items-center gap-1.5 px-2.5 font-normal hover:bg-primary/6 hover:text-primary"
              >
                <span>Bulk Actions</span>
                <span className="flex items-center group-hover:text-primary">
                  <CaretUpDownIcon weight="bold" className="size-3.5 not-group-hover:text-muted-foreground" />
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" sideOffset={9} className="w-fit min-w-[120px]">
              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  const selectedCount = Object.keys(rowSelection).length;
                  toast.error(`${selectedCount} selected item(s) deleted`);
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </BulkActionBox>

        <Pagination
          pageIndex={table.getState().pagination.pageIndex}
          pageCount={table.getPageCount()}
          onPreviousPage={() => table.previousPage()}
          onNextPage={() => table.nextPage()}
          onPageChange={(page) => table.setPageIndex(page)}
          canPreviousPage={table.getCanPreviousPage()}
          canNextPage={table.getCanNextPage()}
          className="sm:ms-auto"
        />
      </div>
    </Card>
  );
}
