import { Settings } from '@yay-bulk-order/common/src/schemas';
import { Controller, useFormContext } from 'react-hook-form';
import { __ } from '@wordpress/i18n';

import { ColorPicker } from '@/components/ui/color-picker';
import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field';
import { Separator } from '@/components/ui/separator';
import { DesignPreviewTable } from './DesignPreviewTable';

export function DesignTab() {
  const { control } = useFormContext<Settings>();

  return (
    <div className="flex flex-col gap-4">
      <div className="mb-3">
        <h2 className="font-semibold">{__('Product Table Design', 'yay-bulk-order')}</h2>
        <p className="text-muted-foreground">{__('Customize product table appearance', 'yay-bulk-order')}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <Controller
            control={control}
            name="design.primaryColor"
            render={({ field, fieldState }) => (
              <Field className="grid grid-cols-[200px_1fr]">
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
            name="design.textColor"
            render={({ field, fieldState }) => (
              <Field className="grid grid-cols-[200px_1fr]">
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
            name="design.textHoverColor"
            render={({ field, fieldState }) => (
              <Field className="grid grid-cols-[200px_1fr]">
                <FieldLabel className="text-xs font-medium">{__('Text Hover Color', 'yay-bulk-order')}</FieldLabel>
                <FieldContent>
                  <ColorPicker value={field.value} onValueChange={field.onChange} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </FieldContent>
              </Field>
            )}
          />

          <Controller
            control={control}
            name="design.descriptionColor"
            render={({ field, fieldState }) => (
              <Field className="grid grid-cols-[200px_1fr]">
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
            name="design.borderColor"
            render={({ field, fieldState }) => (
              <Field className="grid grid-cols-[200px_1fr]">
                <FieldLabel className="text-xs font-medium">{__('Border Color', 'yay-bulk-order')}</FieldLabel>
                <FieldContent>
                  <ColorPicker value={field.value} onValueChange={field.onChange} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </FieldContent>
              </Field>
            )}
          />
        </div>

        <div className="flex flex-col gap-4">
          <Controller
            control={control}
            name="design.backgroundColor"
            render={({ field, fieldState }) => (
              <Field className="grid grid-cols-[200px_1fr]">
                <FieldLabel className="text-xs font-medium">{__('Background Color', 'yay-bulk-order')}</FieldLabel>
                <FieldContent>
                  <ColorPicker value={field.value} onValueChange={field.onChange} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </FieldContent>
              </Field>
            )}
          />

          <Controller
            control={control}
            name="design.buttonBackgroundColor"
            render={({ field, fieldState }) => (
              <Field className="grid grid-cols-[200px_1fr]">
                <FieldLabel className="text-xs font-medium">
                  {__('Button Background Color', 'yay-bulk-order')}
                </FieldLabel>
                <FieldContent>
                  <ColorPicker value={field.value} onValueChange={field.onChange} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </FieldContent>
              </Field>
            )}
          />

          <Controller
            control={control}
            name="design.buttonBackgroundHoverColor"
            render={({ field, fieldState }) => (
              <Field className="grid grid-cols-[200px_1fr]">
                <FieldLabel className="text-xs font-medium">
                  {__('Button Background Hover Color', 'yay-bulk-order')}
                </FieldLabel>
                <FieldContent>
                  <ColorPicker value={field.value} onValueChange={field.onChange} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </FieldContent>
              </Field>
            )}
          />

          <Controller
            control={control}
            name="design.buttonTextColor"
            render={({ field, fieldState }) => (
              <Field className="grid grid-cols-[200px_1fr]">
                <FieldLabel className="text-xs font-medium">{__('Button Text Color', 'yay-bulk-order')}</FieldLabel>
                <FieldContent>
                  <ColorPicker value={field.value} onValueChange={field.onChange} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </FieldContent>
              </Field>
            )}
          />

          <Controller
            control={control}
            name="design.buttonTextHoverColor"
            render={({ field, fieldState }) => (
              <Field className="grid grid-cols-[200px_1fr]">
                <FieldLabel className="text-xs font-medium">
                  {__('Button Text Hover Color', 'yay-bulk-order')}
                </FieldLabel>
                <FieldContent>
                  <ColorPicker value={field.value} onValueChange={field.onChange} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </FieldContent>
              </Field>
            )}
          />
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-4">
        <h2 className="font-semibold"> {__('Preview', 'yay-bulk-order')}</h2>
        <div className="flex items-center justify-center">
          <DesignPreviewTable />
        </div>
      </div>
    </div>
  );
}
