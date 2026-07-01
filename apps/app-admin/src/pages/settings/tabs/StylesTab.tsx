import { Settings } from '@yay-bulk-order/common/src/schemas';
import { Controller, useFormContext } from 'react-hook-form';
import { __ } from '@wordpress/i18n';

import { ColorPicker } from '@/components/ui/color-picker';
import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field';

export function StylesTab() {
  const { control } = useFormContext<Settings>();

  return (
    <div className="flex flex-col gap-4">
      <Controller
        control={control}
        name="colors.primary"
        render={({ field, fieldState }) => (
          <Field className="flex w-full flex-col gap-1.5">
            <FieldLabel className="text-xs font-medium">{__('Primary Color', 'yay-bulk-order')}</FieldLabel>
            <FieldContent>
              <ColorPicker value={field.value} onValueChange={field.onChange} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </FieldContent>
          </Field>
        )}
      />

      <Controller
        control={control}
        name="colors.text"
        render={({ field, fieldState }) => (
          <Field className="flex w-full flex-col gap-1.5">
            <FieldLabel className="text-xs font-medium">{__('Text Color', 'yay-bulk-order')}</FieldLabel>
            <FieldContent>
              <ColorPicker value={field.value} onValueChange={field.onChange} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </FieldContent>
          </Field>
        )}
      />

      <Controller
        control={control}
        name="colors.description"
        render={({ field, fieldState }) => (
          <Field className="flex w-full flex-col gap-1.5">
            <FieldLabel className="text-xs font-medium">{__('Description Color', 'yay-bulk-order')}</FieldLabel>
            <FieldContent>
              <ColorPicker value={field.value} onValueChange={field.onChange} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </FieldContent>
          </Field>
        )}
      />

      <Controller
        control={control}
        name="colors.border"
        render={({ field, fieldState }) => (
          <Field className="flex w-full flex-col gap-1.5">
            <FieldLabel className="text-xs font-medium">{__('Border Color', 'yay-bulk-order')}</FieldLabel>
            <FieldContent>
              <ColorPicker value={field.value} onValueChange={field.onChange} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </FieldContent>
          </Field>
        )}
      />

      <Controller
        control={control}
        name="colors.background"
        render={({ field, fieldState }) => (
          <Field className="flex w-full flex-col gap-1.5">
            <FieldLabel className="text-xs font-medium">{__('Background Color', 'yay-bulk-order')}</FieldLabel>
            <FieldContent>
              <ColorPicker value={field.value} onValueChange={field.onChange} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </FieldContent>
          </Field>
        )}
      />
    </div>
  );
}
