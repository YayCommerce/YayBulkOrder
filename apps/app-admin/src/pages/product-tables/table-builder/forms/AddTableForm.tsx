import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { productTableSchema } from '@yay-bulk-order/common/src/schemas';
import { ProductTableForm } from '@yay-bulk-order/common/src/schemas/product-tables.schema';
import { FieldErrors, FormProvider, useForm } from 'react-hook-form';
import { useMatch } from 'react-router';
import { useDidUpdate } from 'rooks';
import { toast } from 'sonner';
import { __ } from '@wordpress/i18n';

import { getErrorMsg } from '@/lib/helpers/response.helper';
import { useCreateProductTableMutation, useIsMutatingProductTables } from '@/lib/queries/product-table.queries';
import TablePrebuild from '@/pages/product-tables/table-builder/prebuild/TablePrebuild';
import ColumnsStep from '@/pages/product-tables/table-builder/steps/ColumnsStep/ColumnsStep';
import FeaturesStep from '@/pages/product-tables/table-builder/steps/FeaturesStep';
import ProductsStep from '@/pages/product-tables/table-builder/steps/ProductsStep';
import PublishStep from '@/pages/product-tables/table-builder/steps/PublishStep';
import StepsNavBar from '@/pages/product-tables/table-builder/steps/StepsNavBar';
import { BuilderSteps, getColumnsBySlugs } from '@/pages/product-tables/table-builder/table-builder.helper';

const DEFAULT_VALUE: ProductTableForm = {
  title: __('My Product Table', 'yay-bulk-order'),
  query: {
    queryBy: 'all-products',
  },
  columns: getColumnsBySlugs(['product', 'description', 'quantity', 'subtotal', 'add-to-cart']),
  features: {
    hasFilter: true,
    hasSearch: true,
    hasPagination: true,
  },
};

export default function AddTableForm() {
  const isOpening = useMatch({ path: '/product-tables/new' }) !== null;

  const [step, setStep] = useState<BuilderSteps>('prebuild');
  const [savedId, setSavedId] = useState(0);

  const form = useForm<ProductTableForm>({
    resolver: zodResolver(productTableSchema),
    defaultValues: DEFAULT_VALUE,
  });

  const createMutation = useCreateProductTableMutation();
  const isMutating = useIsMutatingProductTables();

  const onSubmit = async (data: ProductTableForm) => {
    if (isMutating) return;

    try {
      const res = await createMutation.mutateAsync(data);
      form.reset(data);
      toast.success(__('Product Table Saved!', 'yay-wholesale-b2b'));
      setSavedId(res.id);
    } catch (error) {
      toast.error(await getErrorMsg(error));
      setSavedId(0);
    }
  };

  const onError = (errors: FieldErrors<ProductTableForm>) => {
    console.log({ errors });
  };

  useDidUpdate(() => {
    if (!isOpening) return;
    form.reset(DEFAULT_VALUE);
    setStep('prebuild');
    setSavedId(0);
  }, [isOpening]);

  return (
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
          {step === 'publish' && <PublishStep tableId={savedId} setSteps={setStep} />}
        </form>
      </div>
    </FormProvider>
  );
}
