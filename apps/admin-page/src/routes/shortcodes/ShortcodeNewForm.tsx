import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { __ } from '@wordpress/i18n';

import { useCreateShortcodeMutation } from '@/lib/queries/shortcodes.queries';
import { shortcodeConfigFormSchema, ShortcodeConfigFormValues } from '@/lib/schemas/shortcodes.schema';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { SheetClose, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ColumnOrder } from './form/ColumnOrder';

export default function ShortcodeNewForm() {
  const navigate = useNavigate();
  const createShortcodeMutation = useCreateShortcodeMutation();

  const form = useForm<ShortcodeConfigFormValues>({
    resolver: zodResolver(shortcodeConfigFormSchema),
    defaultValues: DEFAULT_SHORTCODE,
    mode: 'onSubmit',
  });

  async function onSubmit(values: ShortcodeConfigFormValues) {
    if (createShortcodeMutation.isPending) return;
    await createShortcodeMutation.mutateAsync(values);
    navigate('/shortcodes');
  }

  return (
    <FormProvider {...form}>
      <form id="add-shortcode-form" onSubmit={form.handleSubmit(onSubmit)} className="flex h-full flex-col">
        <SheetHeader>
          <SheetTitle>{__('New Shortcode Configuration', 'yay-bulk-order')}</SheetTitle>
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
          <Button type="submit">{__('Create Shortcode', 'yay-bulk-order')}</Button>
        </SheetFooter>
      </form>
    </FormProvider>
  );
}

const DEFAULT_SHORTCODE: ShortcodeConfigFormValues = {
  title: 'New Bulk Order Shortcode',
  pattern: 'simple',
  columns: [
    'yay-bulk-order/column-product-title',
    'yay-bulk-order/column-product-price',
    'yay-bulk-order/column-product-stock',
    'yay-bulk-order/column-add-to-cart',
  ],
};
