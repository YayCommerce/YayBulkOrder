import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdateEffect } from 'ahooks';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { __ } from '@wordpress/i18n';

import { useShortcodeQuery, useUpdateShortcodeMutation } from '@/lib/queries/shortcodes.queries';
import { shortcodeConfigFormSchema, ShortcodeConfigFormValues } from '@/lib/schemas/shortcodes.schema';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { SheetClose, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ColumnOrder } from './form/ColumnOrder';

export default function ShortcodeEditForm({ editId }: { editId: number }) {
  const navigate = useNavigate();
  const { data: shortcodeConfig } = useShortcodeQuery(editId);
  const updateShortcodeMutation = useUpdateShortcodeMutation();

  const form = useForm<ShortcodeConfigFormValues>({
    resolver: zodResolver(shortcodeConfigFormSchema),
    defaultValues: shortcodeConfig ?? DEFAULT_SHORTCODE,
    mode: 'onSubmit',
  });

  async function onSubmit(values: ShortcodeConfigFormValues) {
    if (updateShortcodeMutation.isPending) return;
    await updateShortcodeMutation.mutateAsync({ shortcodeId: editId, payload: values });
    navigate('/shortcodes');
  }

  useUpdateEffect(() => {
    if (shortcodeConfig) {
      form.reset(shortcodeConfig);
    }
  }, [shortcodeConfig, form]);

  return (
    <FormProvider {...form}>
      <form id="edit-shortcode-form" onSubmit={form.handleSubmit(onSubmit)} className="flex h-full flex-col">
        <SheetHeader>
          <SheetTitle>{__('Edit Shortcode Configuration', 'yay-bulk-order')}</SheetTitle>
          <SheetDescription>
            <Badge variant="muted">[ybo-form-shortcode id="{editId}"]</Badge>
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 p-5">
          <FieldGroup className="grid gap-4">
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>{__('Title', 'yay-bulk-order')}</FieldLabel>
                  <Input aria-invalid={fieldState.invalid} {...field} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="pattern"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>{__('Pattern', 'yay-bulk-order')}</FieldLabel>
                  <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="simple" id="pattern-simple" />
                      <label
                        htmlFor="pattern-simple"
                        className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {__('Simple', 'yay-bulk-order')}
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="filterable" id="pattern-filterable" />
                      <label
                        htmlFor="pattern-filterable"
                        className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {__('Filterable', 'yay-bulk-order')}
                      </label>
                    </div>
                  </RadioGroup>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="columns"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className="text-foreground-400 text-xs font-medium">
                    {__('Column Order', 'yay-bulk-order')}
                  </FieldLabel>
                  <ColumnOrder value={field.value} onValueChange={field.onChange} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </div>

        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">{__('Cancel', 'yay-bulk-order')}</Button>
          </SheetClose>
          <Button type="submit">{__('Save Changes', 'yay-bulk-order')}</Button>
        </SheetFooter>
      </form>
    </FormProvider>
  );
}

const DEFAULT_SHORTCODE: ShortcodeConfigFormValues = {
  title: 'Shortcode Title',
  pattern: 'simple',
  columns: [
    'yay-bulk-order/column-product-title',
    'yay-bulk-order/column-product-price',
    'yay-bulk-order/column-product-stock',
    'yay-bulk-order/column-add-to-cart',
  ],
};
