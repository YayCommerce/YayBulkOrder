import { useState } from 'react';
import { useMatch, useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import TablePrebuild from '@/pages/product-tables/table-builder/prebuild/TablePrebuild';
import ColumnsStep from '@/pages/product-tables/table-builder/steps/ColumnsStep';
import ProductsStep from '@/pages/product-tables/table-builder/steps/ProductsStep';
import { BuilderSteps } from '@/pages/product-tables/table-builder/TableBuilder.helper';

export default function TableBuilder() {
  const isOpening = useMatch({ path: '/product-tables/new' }) !== null;
  const navigate = useNavigate();

  const [steps, setSteps] = useState<BuilderSteps>('prebuild');

  return (
    <Dialog
      open={isOpening}
      onOpenChange={(open) => {
        if (!open) navigate('/product-tables');
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() => {
            setSteps('prebuild');
            navigate('/product-tables/new');
          }}
        >
          Build Product Table
        </Button>
      </DialogTrigger>
      <DialogContent className="h-screen! w-screen! max-w-none! flex flex-col gap-0 overflow-hidden p-0">
        {steps === 'prebuild' && <TablePrebuild setSteps={setSteps} />}
        {steps === 'products' && <ProductsStep setSteps={setSteps} />}
        {steps === 'columns' && <ColumnsStep setSteps={setSteps} />}
      </DialogContent>
    </Dialog>
  );
}
