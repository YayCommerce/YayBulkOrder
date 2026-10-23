import { ProductTableForm } from '@yay-bulk-order/common/src/schemas/product-tables.schema';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { __ } from '@wordpress/i18n';

import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { NumberInput } from '@/components/ui/number-input';
import { Switch } from '@/components/ui/switch';
import { BuilderStepsProps } from '@/pages/product-tables/table-builder/table-builder.helper';

export default function FeaturesStep({ setSteps }: BuilderStepsProps) {
  const { control } = useFormContext<ProductTableForm>();
  const hasPagination = useWatch({ control, name: 'features.hasPagination' });

  return (
    <Card className="w-2xl max-w-2xl">
      <CardHeader>
        <CardTitle className="text-base font-medium">{__('Table features', 'yay-bulk-order')}</CardTitle>
        <CardDescription>{__('Enable or disable interactive features.', 'yay-bulk-order')}</CardDescription>
      </CardHeader>
      <div className="flex min-h-60 flex-col gap-5">
        <div className="flex flex-col gap-3">
          <Controller
            control={control}
            name="features.hasFilter"
            render={({ field }) => (
              <div className="border-border flex items-center justify-between rounded-md border px-4 py-3">
                <Label className="text-sm">{__('Filter', 'yay-bulk-order')}</Label>
                <Switch size="sm" checked={field.value} onCheckedChange={field.onChange} />
              </div>
            )}
          />
          <Controller
            control={control}
            name="features.hasSearch"
            render={({ field }) => (
              <div className="border-border flex items-center justify-between rounded-md border px-4 py-3">
                <Label className="text-sm">{__('Search', 'yay-bulk-order')}</Label>
                <Switch size="sm" checked={field.value} onCheckedChange={field.onChange} />
              </div>
            )}
          />
          <Controller
            control={control}
            name="features.hasPagination"
            render={({ field }) => (
              <div className="border-border flex items-center justify-between rounded-md border px-4 py-3">
                <Label className="text-sm">{__('Pagination', 'yay-bulk-order')}</Label>
                <Switch size="sm" checked={field.value} onCheckedChange={field.onChange} />
              </div>
            )}
          />
          {hasPagination && (
            <Controller
              control={control}
              name="features.pageSize"
              render={({ field }) => (
                <div className="border-border flex items-center justify-between rounded-md border px-4 py-3">
                  <Label className="text-sm">{__('Page Size', 'yay-bulk-order')}</Label>
                  <NumberInput
                    value={field.value}
                    onValueChange={field.onChange}
                    min={0}
                    placeholder={__('Auto', 'yay-bulk-order')}
                    max={100}
                    className="w-20"
                  />
                </div>
              )}
            />
          )}
        </div>
      </div>
      <div className="flex items-center justify-center gap-4 border-t pt-6">
        <Button variant="outline" onClick={() => setSteps('columns')}>
          {__('Back', 'yay-bulk-order')}
        </Button>
        <Button variant="primary" onClick={() => setSteps('publish')}>
          {__('Next', 'yay-bulk-order')}
        </Button>
      </div>
    </Card>
  );
}
