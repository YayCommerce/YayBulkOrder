import { Settings } from '@yay-bulk-order/common/src/schemas';
import { Controller, useFormContext } from 'react-hook-form';
import { __ } from '@wordpress/i18n';

import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field';
import { NumberInput } from '@/components/ui/number-input';

export function GeneralTab() {
  const { control } = useFormContext<Settings>();

  return (
    <div className="flex flex-col gap-4">
      <Controller
        control={control}
        name="general.defaultCartQuantity"
        render={({ field, fieldState }) => (
          <Field className="flex w-full flex-col gap-1.5">
            <FieldLabel className="text-xs font-medium">{__('Default cart quantity', 'yay-bulk-order')}</FieldLabel>
            <FieldContent>
              <NumberInput ref={field.ref} value={field.value} onValueChange={field.onChange} step={5} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </FieldContent>
          </Field>
        )}
      />

      <Controller
        control={control}
        name="general.defaultPageSize"
        render={({ field, fieldState }) => (
          <Field className="flex w-full flex-col gap-1.5">
            <FieldLabel className="text-xs font-medium">{__('Default page size', 'yay-bulk-order')}</FieldLabel>
            <FieldContent>
              <NumberInput ref={field.ref} value={field.value} onValueChange={field.onChange} step={5} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </FieldContent>
          </Field>
        )}
      />
    </div>
  );
}
