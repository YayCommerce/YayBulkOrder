import { Settings } from '@yay-bulk-order/common/src/schemas';
import { Controller, useFormContext } from 'react-hook-form';
import { __ } from '@wordpress/i18n';

import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { NumberInput } from '@/components/ui/number-input';

export function GeneralTab() {
  const { control } = useFormContext<Settings>();

  return (
    <div className="flex flex-col gap-4">
      <Controller
        control={control}
        name="general.defaultCartQuantity"
        render={({ field, fieldState }) => (
          <Field orientation="horizontal" className="flex items-center justify-between rounded-md border p-4">
            <div>
              <Label
                htmlFor="purchase-list-is-add-to-account-page"
                className="flex items-center gap-2 font-medium leading-3"
              >
                {__('Default Cart Quantity', 'yay-bulk-order')}
              </Label>
              <p className="text-muted-foreground mt-2 text-xs font-normal">
                {__('Default product quantity input in product table.', 'yay-bulk-order')}
              </p>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </div>
            <NumberInput value={field.value} onValueChange={field.onChange} step={5} className="w-20" />
          </Field>
        )}
      />

      <Controller
        control={control}
        name="general.defaultPageSize"
        render={({ field, fieldState }) => (
          <Field orientation="horizontal" className="flex items-center justify-between rounded-md border p-4">
            <div>
              <Label
                htmlFor="purchase-list-is-add-to-account-page"
                className="flex items-center gap-2 font-medium leading-3"
              >
                {__('Default Page Size', 'yay-bulk-order')}
              </Label>
              <p className="text-muted-foreground mt-2 text-xs font-normal">
                {__('Number of products per page in product table.', 'yay-bulk-order')}
              </p>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </div>
            <NumberInput value={field.value} onValueChange={field.onChange} step={5} className="w-20" />
          </Field>
        )}
      />
    </div>
  );
}
