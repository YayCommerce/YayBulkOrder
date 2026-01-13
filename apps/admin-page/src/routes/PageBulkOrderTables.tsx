import { useIsMutating } from '@tanstack/react-query';
import { useMatch, useNavigate } from 'react-router';

import { Sheet } from '@/components/ui/sheet';

import TableList from './bulk-order-tables/TableList';
import TableSheetEdit from './bulk-order-tables/TableSheetEdit';
import TableSheetNew from './bulk-order-tables/TableSheetNew';

export default function PageBulkOrderTables() {
  const navigate = useNavigate();
  const isIndexRoute = useMatch('/bulk-order-tables');
  const isNewRoute = useMatch('/bulk-order-tables/new');
  const isEditRoute = useMatch('/bulk-order-tables/:tableId');

  const isOpenSheet = isIndexRoute === null;
  const isMutatingTable = useIsMutating({ mutationKey: ['tables'] }) > 0;

  function setIsOpenSheet(open: boolean) {
    if (isMutatingTable) return;

    if (!open) {
      navigate('/bulk-order-tables');
    }
  }

  return (
    <>
      <TableList />
      <Sheet open={isOpenSheet} onOpenChange={setIsOpenSheet}>
        {isNewRoute && <TableSheetNew />}
        {isEditRoute && <TableSheetEdit />}
      </Sheet>
    </>
  );
}
