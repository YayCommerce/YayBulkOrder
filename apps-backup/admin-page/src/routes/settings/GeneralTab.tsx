import { Controller, useFormContext } from 'react-hook-form';
import { __ } from '@wordpress/i18n';

import { Settings } from '@yay-bulk-order/common/types/settings.schema';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { NumberInput } from '@/components/ui/number-input';

export default function GeneralTab() {
  const { control } = useFormContext<Settings>();

  return (
    <Card>
      <CardContent>
        <FieldGroup className="grid grid-cols-3 gap-4">
          <Controller
            name="general.defaultCartQuantity"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{__('Default Cart Quantity', 'yay-bulk-order')}</FieldLabel>
                <NumberInput
                  aria-invalid={fieldState.invalid}
                  min={1}
                  step={10}
                  value={field.value}
                  onValueChange={field.onChange}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="general.pageSize"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{__('Page Size', 'yay-bulk-order')}</FieldLabel>
                <NumberInput
                  aria-invalid={fieldState.invalid}
                  min={1}
                  step={10}
                  value={field.value}
                  onValueChange={field.onChange}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
