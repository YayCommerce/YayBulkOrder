import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProductTable, productTableSchema } from '@yay-bulk-order/common/src/schemas';
import { ProductTableForm } from '@yay-bulk-order/common/src/schemas/product-tables.schema';
import { FieldErrors, FormProvider, useForm } from 'react-hook-form';
import { useDidUpdate } from 'rooks';
import { toast } from 'sonner';
import { __ } from '@wordpress/i18n';

import { getErrorMsg } from '@/lib/helpers/response.helper';
import { useIsMutatingProductTables, useUpdateProductTableMutation } from '@/lib/queries/product-table.queries';
import ColumnsStep from '@/pages/product-tables/table-builder/steps/ColumnsStep/ColumnsStep';
import FeaturesStep from '@/pages/product-tables/table-builder/steps/FeaturesStep';
import ProductsStep from '@/pages/product-tables/table-builder/steps/ProductsStep';
import PublishStep from '@/pages/product-tables/table-builder/steps/PublishStep';
import StepsNavBar from '@/pages/product-tables/table-builder/steps/StepsNavBar';
import { BuilderSteps } from '@/pages/product-tables/table-builder/table-builder.helper';

type EditTableFormProps = {
  table: ProductTable;
};

export default function EditTableForm({ table }: EditTableFormProps) {
  const [step, setStep] = useState<BuilderSteps>('products');

  const form = useForm<ProductTableForm>({
    resolver: zodResolver(productTableSchema),
    defaultValues: table,
  });

  const updateMutation = useUpdateProductTableMutation(table.id);
  const isMutating = useIsMutatingProductTables();

  const onSubmit = async (data: ProductTableForm) => {
    if (isMutating) return;

    try {
      await updateMutation.mutateAsync(data);
      form.reset(data);
      toast.success(__('Product Table Saved!', 'yay-wholesale-b2b'));
    } catch (error) {
      toast.error(await getErrorMsg(error));
    }
  };

  const onError = (errors: FieldErrors<ProductTableForm>) => {
    console.log({ errors });
  };

  useDidUpdate(() => {
    form.reset(table);
  }, [table]);

  return (
    <FormProvider {...form}>
      <div className="border-b px-8 py-4">
        <StepsNavBar step={step} setStep={setStep} />
      </div>
      <div className="mx-auto flex h-full max-w-6xl flex-col justify-center gap-4">
        <form id="product-table-form" onSubmit={form.handleSubmit(onSubmit, onError)}>
          {step === 'products' && <ProductsStep setSteps={setStep} />}
          {step === 'columns' && <ColumnsStep setSteps={setStep} />}
          {step === 'features' && <FeaturesStep setSteps={setStep} />}
          {step === 'publish' && <PublishStep tableId={table.id} />}
        </form>
      </div>
    </FormProvider>
  );
}
