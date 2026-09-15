import { ProductTable } from '@yay-bulk-order/common/src/schemas';
import { useNavigate } from 'react-router';
import { __ } from '@wordpress/i18n';

import { useCacheProductTable } from '@/lib/queries/product-table.queries';
import { Badge } from '@/components/ui/badge';
import { isShopApplied } from '@/pages/product-tables/product-tables.helper';

type TableTittleProps = {
  table: ProductTable;
};

const { isBlockTheme } = window.yayBulkOrderMeta.wpMeta;

export default function TableTitle({ table }: TableTittleProps) {
  const { cacheTable } = useCacheProductTable();
  const navigate = useNavigate();

  return (
    <span
      className="flex cursor-pointer items-center gap-2 font-medium"
      onClick={() => {
        cacheTable(table);
        navigate(`/product-tables/edit/${table.id}`);
      }}
    >
      {table.title}{' '}
      {!isBlockTheme && isShopApplied(table.id) && (
        <Badge variant="primary-soft">{__('Using in Shop', 'yay-bulk-order')}</Badge>
      )}
    </span>
  );
}
