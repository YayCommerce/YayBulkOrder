import { useMemo } from 'react';
import { ProductTableForm } from '@yay-bulk-order/common/src/schemas/product-tables.schema';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { __ } from '@wordpress/i18n';

import { useAllProductsQuery } from '@/lib/queries/products.queries';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MultiSelectCombobox, MultiSelectOption } from '@/components/custom/multi-select-combobox';
import { BuilderStepsProps } from '@/pages/product-tables/table-builder/table-builder.helper';

const { categories } = window.yayBulkOrderMeta.wcMeta;

export default function ProductsStep({ setSteps }: BuilderStepsProps) {
  const { control, trigger } = useFormContext<ProductTableForm>();
  const queryBy = useWatch({ control, name: 'query.queryBy' });

  const { products, isLoadingAll } = useAllProductsQuery();
  const categoryOptions: MultiSelectOption[] = useMemo(
    () =>
      categories.map((cat) => ({
        value: cat.id,
        label: cat.title,
      })),
    [categories],
  );

  const productOptions: MultiSelectOption[] = useMemo(
    () =>
      products.map((product) => ({
        value: product.id,
        label: product.name,
      })),
    [products],
  );

  const handleNext = async () => {
    if (await trigger(['query.categories', 'query.products'])) setSteps('columns');
  };

  return (
    <Card className="w-2xl max-w-2xl">
      <CardHeader>
        <CardTitle className="text-base font-medium">{__('Select products to display', 'yay-bulk-order')}</CardTitle>
        <CardDescription>{__('Choose which products appear in the table.', 'yay-bulk-order')}</CardDescription>
      </CardHeader>
      <div className="flex min-h-60 flex-col gap-5">
        <Controller
          control={control}
          name="query.queryBy"
          render={({ field }) => (
            <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="all-products" id="query-all-products" />
                <Label htmlFor="query-all-products">{__('All products', 'yay-bulk-order')}</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="by-categories" id="query-by-categories" />
                <Label htmlFor="query-by-categories">{__('By categories', 'yay-bulk-order')}</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="featured" id="query-featured" />
                <Label htmlFor="query-featured">{__('Featured products', 'yay-bulk-order')}</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="sale" id="query-sale" />
                <Label htmlFor="query-sale">{__('On sale products', 'yay-bulk-order')}</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="top-rated" id="query-top-rated" />
                <Label htmlFor="query-top-rated">{__('Top rated products', 'yay-bulk-order')}</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="hand-picked" id="query-hand-picked" />
                <Label htmlFor="query-hand-picked">{__('Hand-picked products', 'yay-bulk-order')}</Label>
              </div>
            </RadioGroup>
          )}
        />

        {queryBy === 'by-categories' && (
          <Controller
            control={control}
            name="query.categories"
            render={({ field, fieldState }) => (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs">{__('Categories:', 'yay-bulk-order')}</span>
                  <MultiSelectCombobox
                    options={categoryOptions}
                    value={field.value ?? []}
                    onChange={field.onChange}
                    searchPlaceholder={__('Search categories...', 'yay-bulk-order')}
                    emptyText={__('No categories found', 'yay-bulk-order')}
                  />
                </div>
                {fieldState.error && <p className="text-destructive text-xs">{fieldState.error.message}</p>}
              </div>
            )}
          />
        )}

        {queryBy === 'hand-picked' && (
          <Controller
            control={control}
            name="query.products"
            render={({ field, fieldState }) => (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs">{__('Products:', 'yay-bulk-order')}</span>
                  <MultiSelectCombobox
                    options={productOptions}
                    value={field.value ?? []}
                    onChange={field.onChange}
                    loading={isLoadingAll}
                    searchPlaceholder={__('Search products...', 'yay-bulk-order')}
                    emptyText={__('No products found', 'yay-bulk-order')}
                  />
                </div>
                {fieldState.error && <p className="text-destructive text-xs">{fieldState.error.message}</p>}
              </div>
            )}
          />
        )}
      </div>
      <div className="flex items-center justify-center gap-4 border-t pt-6">
        <Button type="button" variant="primary" size="sm" onClick={handleNext}>
          {__('Next', 'yay-bulk-order')}
        </Button>
      </div>
    </Card>
  );
}
