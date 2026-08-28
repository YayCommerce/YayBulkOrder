import { Settings } from '@yay-bulk-order/common/src/schemas';
import { RotateCcw } from 'lucide-react';
import { Controller, useFormContext } from 'react-hook-form';
import { __ } from '@wordpress/i18n';

import { Button } from '@/components/ui/button';
import { ColorPicker } from '@/components/ui/color-picker';
import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field';
import { Separator } from '@/components/ui/separator';
import { DesignPreviewTable } from './DesignPreviewTable';

const { tableColors: DefaultColorsPreset } = window.yayBulkOrderAdminData.defaultPresets;

export function DesignTab() {
  const { control, setValue } = useFormContext<Settings>();

  const resetToDefaultPreset = () => {
    setValue('colors', DefaultColorsPreset, { shouldDirty: true, shouldValidate: true });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="font-semibold">{__('Product Table Design', 'yay-bulk-order')}</h2>
          <p className="text-muted-foreground">{__('Customize product table appearance', 'yay-bulk-order')}</p>
        </div>
        <Button variant="outline" className="text-[12px]" onClick={resetToDefaultPreset}>
          <RotateCcw className="size-3.5" />
          {__('Reset to Default', 'yay-bulk-order')}
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <Controller
            control={control}
            name="colors.primary"
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
            name="colors.text"
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
            name="colors.textHover"
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
            name="colors.description"
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
            name="colors.border"
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
            name="colors.background"
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
            name="colors.buttonBackground"
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
            name="colors.buttonBackgroundHover"
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
            name="colors.buttonText"
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
            name="colors.buttonTextHover"
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
        <div className="bg-muted flex items-center justify-center rounded-md p-5">
          <DesignPreviewTable />
        </div>
      </div>
    </div>
  );
}
