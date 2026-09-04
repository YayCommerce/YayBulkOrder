import { useMemo } from 'react';
import { useMatch, useNavigate, useParams } from 'react-router';

import { useProductTableQuery } from '@/lib/queries/product-table.queries';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import AddTableForm from '@/pages/product-tables/table-builder/forms/AddTableForm';
import EditTableForm from '@/pages/product-tables/table-builder/forms/EditTableForm';

export default function TableBuilder() {
  const { tableId } = useParams();
  const isAdding = useMatch({ path: '/product-tables/new' }) !== null;
  const isEditing = useMatch({ path: '/product-tables/edit/:tableId' }) !== null;

  const navigate = useNavigate();
  const { data: editingProductTable } = useProductTableQuery(parseInt(tableId ?? '0'));

  const isOpening = useMemo(
    () => isAdding || (isEditing && editingProductTable !== null),
    [isAdding, isEditing, editingProductTable],
  );

  return (
    <Dialog
      open={isOpening}
      onOpenChange={(open) => {
        if (!open) navigate('/product-tables');
      }}
    >
      <DialogContent className="h-screen! w-screen! max-w-none! flex flex-col gap-0 overflow-hidden p-0">
        {isAdding && <AddTableForm />}
        {isEditing && editingProductTable !== null && <EditTableForm table={editingProductTable!} />}
      </DialogContent>
    </Dialog>
  );
}
