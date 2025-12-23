import { useEffect, useMemo, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  PaginationState,
  RowSelectionState,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import { CalendarIcon, ChevronDown, X } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { useDebounce } from 'react-use';

import { getProducts, ProductParams } from '@/lib/queries';
import { __, formatDateRange } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import ProductsTableSkeleton from './ProductsTableSkeleton';
import { columns } from './ProductsColumns';

type StockStatusFilter = (typeof STOCK_STATUS_OPTIONS)[number];

const STOCK_STATUS_OPTIONS = ['all', 'in_stock', 'out_of_stock'] as const;

const STOCK_STATUS_MESSAGES = {
  all: __('All Stock Status'),
  in_stock: __('In Stock'),
  out_of_stock: __('Out of Stock'),
} as const;

export default function BulkOrderTable() {
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [stockStatusFilter, setStockStatusFilter] = useState<StockStatusFilter>('all');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [open, setOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const productQueryParams: ProductParams = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      stock_status: stockStatusFilter,
      search: debouncedSearchText,
      sortField: sorting.length > 0 ? sorting[0].id : undefined,
      sortVal: sorting.length > 0 ? (sorting[0].desc ? 'descending' : 'ascending') : undefined,
    }),
    [pagination, debouncedSearchText, sorting, stockStatusFilter],
  );

  const {
    data: products,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ['products', productQueryParams],
    queryFn: () => getProducts(productQueryParams),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  const [cancel] = useDebounce(
    () => {
      setDebouncedSearchText(searchText);
    },
    300,
    [searchText],
  );

  const handleSearchChange = (value: string) => {
    setSearchText(value);

    if (value === '') {
      cancel();
      setDebouncedSearchText('');
    }

    table.firstPage();
  };

  const table = useReactTable({
    data: products?.data || [],
    columns,
    pageCount: Math.ceil((products?.totalItem ?? 0) / pagination.pageSize),
    state: {
      sorting,
      pagination,
      rowSelection,
    },
    manualPagination: true,
    manualSorting: true,
    getRowId: (row: any) => row.id.toString(),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
  });

  const handleDateSelect = (range: DateRange | undefined) => {
    setDateRange(range);
    table.firstPage();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDateRange(undefined);
    table.firstPage();
  };

  return (
    <div className="mx-auto mt-6 max-w-[90%] px-2.5">
      <h1 className="py-4 text-3xl font-bold md:py-8">{__('Bulk Order Products')}</h1>

      <Card className="mt-7.5">
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Input
              id="products_search"
              placeholder={__('Enter product name or SKU…')}
              value={searchText}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  cancel();
                  setDebouncedSearchText(searchText);
                  table.firstPage();
                }
              }}
              className="w-64"
            />
            <div className="flex flex-col items-start gap-4 md:flex-row md:items-center">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-70 justify-start gap-4 font-normal">
                    <CalendarIcon className="h-4 w-4" />
                    <span className="flex-1 text-left">{formatDateRange(dateRange)}</span>
                    {dateRange?.from && (
                      <div
                        className="flex h-4 w-4 items-center justify-center p-0 hover:bg-transparent"
                        onClick={handleClear}
                        role="button"
                        tabIndex={0}
                      >
                        <X className="h-3 w-3" />
                      </div>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={handleDateSelect}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
              <div className="flex items-start gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="min-w-[120px] justify-between">
                      {STOCK_STATUS_MESSAGES[stockStatusFilter]}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {Object.entries(STOCK_STATUS_MESSAGES).map(([key, value]) => (
                      <DropdownMenuCheckboxItem
                        iconPosition="right"
                        key={key}
                        checked={stockStatusFilter === key}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setStockStatusFilter(key as StockStatusFilter);
                          }
                        }}
                        onSelect={(e) => e.preventDefault()}
                      >
                        {value}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
          <div className="mt-4 w-full overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading || isFetching ? (
                  <ProductsTableSkeleton
                    rows={pagination.pageSize}
                  />
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          className={`px-2 py-4 ${
                            cell.column.id === 'id'
                              ? 'pr-0'
                              : cell.column.id === 'name'
                                ? 'max-w-xs'
                                : cell.column.id === 'sku'
                                  ? 'max-w-[200px] truncate'
                                  : ''
                          }`}
                          key={cell.id}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      {error.message ?? __('Failed to fetch products')}
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      {__('No products found')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-col items-start justify-between gap-4 space-x-2 py-4 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                {__('Total')}: {products?.totalItem ?? 0}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">{__('Result per page')}:</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-[70px] justify-between">
                    {pagination.pageSize}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {[10, 20, 30, 40, 50, 100, 150, 200, 300].map((size) => (
                    <DropdownMenuCheckboxItem
                      iconPosition="right"
                      key={size}
                      checked={pagination.pageSize === size}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setPagination((prev) => ({
                            ...prev,
                            pageSize: size,
                            pageIndex: 0,
                          }));
                        }
                      }}
                    >
                      {size}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Go to page:</span>
                <Input
                  min="1"
                  max={table.getPageCount() || 1}
                  type="number"
                  className="w-[70px] cursor-text"
                  value={(pagination.pageIndex + 1).toString().replace(/^0+/, '')}
                  onChange={(e) =>
                    setPagination((prev) => ({ ...prev, pageIndex: +e.target.value - 1 }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      table.setPageIndex(+(e.target as HTMLInputElement).value - 1);
                    }
                  }}
                />
              </div>
              <Button
                className="cursor-pointer"
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                {__('Previous')}
              </Button>
              <span className="text-sm font-medium">
                {pagination.pageIndex + 1} of {table.getPageCount()}
              </span>
              <Button
                className="cursor-pointer"
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                {__('Next')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
