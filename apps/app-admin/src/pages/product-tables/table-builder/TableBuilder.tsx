import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProductTable, productTableSchema } from '@yay-bulk-order/common/src/schemas';
import { FieldErrors, FormProvider, useForm } from 'react-hook-form';
import { useMatch, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { __ } from '@wordpress/i18n';

import { getErrorMsg } from '@/lib/helpers/response.helper';
import { useCreateProductTableMutation, useIsMutatingProductTables } from '@/lib/queries/product-table.queries';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import TablePrebuild from '@/pages/product-tables/table-builder/prebuild/TablePrebuild';
import ColumnsStep from '@/pages/product-tables/table-builder/steps/ColumnsStep/ColumnsStep';
import FeaturesStep from '@/pages/product-tables/table-builder/steps/FeaturesStep';
import ProductsStep from '@/pages/product-tables/table-builder/steps/ProductsStep';
import PublishStep from '@/pages/product-tables/table-builder/steps/PublishStep';
import StepsNavBar from '@/pages/product-tables/table-builder/steps/StepsNavBar';
import { BuilderSteps, getColumnsBySlugs } from '@/pages/product-tables/table-builder/table-builder.helper';

const DEFAULT_VALUE: ProductTable = {
  title: __('My Product Table', 'yay-bulk-order'),
  query: {
    queryBy: 'all',
  },
  columns: getColumnsBySlugs(['product', 'price', 'quantity', 'subtotal', 'cart']),
  features: {
    hasFilter: true,
    hasSearch: true,
    hasPagination: true,
    pageSize: 10,
  },
};

export default function TableBuilder() {
  const isOpening = useMatch({ path: '/product-tables/new' }) !== null;
  const navigate = useNavigate();

  const [step, setStep] = useState<BuilderSteps>('prebuild');

  const form = useForm<ProductTable>({
    resolver: zodResolver(productTableSchema),
    defaultValues: DEFAULT_VALUE,
  });

  const createMutation = useCreateProductTableMutation();
  const isMutating = useIsMutatingProductTables();

  const onSubmit = async (data: ProductTable) => {
    if (isMutating) return;

    try {
      const res = await createMutation.mutateAsync(data);
      // keep the edited data, just persist the server-assigned id and clear the dirty state
      form.reset({ ...data, id: res.id });
      toast.success(__('Product Table Saved!', 'yay-wholesale-b2b'));
    } catch (error) {
      toast.error(await getErrorMsg(error));
    }
  };

  const onError = (errors: FieldErrors<ProductTable>) => {
    console.log({ errors });
  };

  return (
    <Dialog
      open={isOpening}
      onOpenChange={(open) => {
        if (!open) navigate('/product-tables');
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="primary-outline-fill"
          size="sm"
          className="w-fit"
          onClick={() => {
            setStep('prebuild');
            form.reset(DEFAULT_VALUE);
            navigate('/product-tables/new');
          }}
        >
          {__('Build Product Table', 'yay-bulk-order')}
        </Button>
      </DialogTrigger>
      <DialogContent className="h-screen! w-screen! max-w-none! flex flex-col gap-0 overflow-hidden p-0">
        <FormProvider {...form}>
          {step === 'prebuild' ? (
            <div className="flex items-center gap-4 border-b p-4">
              {/* Logo */}
              <div className="border-border px-0.75 pt-0.75 h-fit w-fit bg-[#FFF5DB]">
                <img
                  src={`${window.yayBulkOrderMeta.bulkOrderMeta.assetsUrl}/images/YayBulkOrder.svg`}
                  alt="YayBulkOrder"
                  className="size-8.5"
                />
              </div>
              <div className="text-lg font-semibold">Yay Bulk Order</div>
            </div>
          ) : (
            <div className="border-b px-8 py-4">
              <StepsNavBar step={step} setStep={setStep} />
            </div>
          )}
          <div className="mx-auto flex h-full max-w-6xl flex-col justify-center gap-4">
            <form id="product-table-form" onSubmit={form.handleSubmit(onSubmit, onError)}>
              {step === 'prebuild' && <TablePrebuild setSteps={setStep} />}
              {step === 'products' && <ProductsStep setSteps={setStep} />}
              {step === 'columns' && <ColumnsStep setSteps={setStep} />}
              {step === 'features' && <FeaturesStep setSteps={setStep} />}
              {step === 'publish' && <PublishStep />}
            </form>
          </div>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
