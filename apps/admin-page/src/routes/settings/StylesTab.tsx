import { Controller, useFormContext } from 'react-hook-form';
import { __ } from '@wordpress/i18n';

import { Settings } from '@yay-bulk-order/common/types/settings.schema';
import { Card, CardContent } from '@/components/ui/card';
import { ColorPicker } from '@/components/ui/color-picker';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

export default function StylesTab() {
  const { control } = useFormContext<Settings>();

  return (
    <Card>
      <CardContent>
        <FieldGroup className="grid grid-cols-3 gap-4">
          <Controller
            name="styles.colors.primary"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{__('Primary Color', 'yay-bulk-order')}</FieldLabel>
                <ColorPicker aria-invalid={fieldState.invalid} value={field.value} onValueChange={field.onChange} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="styles.colors.textNormal"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{__('Text Normal Color', 'yay-bulk-order')}</FieldLabel>
                <ColorPicker aria-invalid={fieldState.invalid} value={field.value} onValueChange={field.onChange} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="styles.colors.backgroundNormal"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{__('Background Normal Color', 'yay-bulk-order')}</FieldLabel>
                <ColorPicker aria-invalid={fieldState.invalid} value={field.value} onValueChange={field.onChange} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="styles.colors.textSecondary"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{__('Text Secondary Color', 'yay-bulk-order')}</FieldLabel>
                <ColorPicker aria-invalid={fieldState.invalid} value={field.value} onValueChange={field.onChange} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="styles.colors.backgroundSecondary"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{__('Background Secondary Color', 'yay-bulk-order')}</FieldLabel>
                <ColorPicker aria-invalid={fieldState.invalid} value={field.value} onValueChange={field.onChange} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="styles.colors.borderColor"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{__('Border Color', 'yay-bulk-order')}</FieldLabel>
                <ColorPicker aria-invalid={fieldState.invalid} value={field.value} onValueChange={field.onChange} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldGroup>

        <Separator className="my-6" />

        <FieldGroup className="grid grid-cols-3 gap-4">
          <Controller
            name="styles.borderRadius"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{__('Border Radius', 'yay-bulk-order')}</FieldLabel>
                <Select aria-invalid={fieldState.invalid} value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">{__('Small', 'yay-bulk-order')}</SelectItem>
                    <SelectItem value="normal">{__('Normal', 'yay-bulk-order')}</SelectItem>
                    <SelectItem value="large">{__('Large', 'yay-bulk-order')}</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
