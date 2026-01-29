import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { __ } from '@wordpress/i18n';

import { useCreateShortcodeMutation } from '@/lib/queries/shortcodes.queries';
import {
  shortcodeConfigFormSchema,
  ShortcodeConfigFormValues,
} from '@/lib/schemas/shortcodes.schema';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ColumnOrder } from './ColumnOrder';

export default function ShortcodeNew() {
  const navigate = useNavigate();
  const { mutateAsync: createShortcode, isPending } = useCreateShortcodeMutation();

  const form = useForm<ShortcodeConfigFormValues>({
    resolver: zodResolver(shortcodeConfigFormSchema),
    defaultValues: DEFAULT_SHORTCODE,
    mode: 'onSubmit',
  });

  async function onSubmit(values: ShortcodeConfigFormValues) {
    await createShortcode(values);
    navigate('/shortcodes');
  }

  return (
    <FormProvider {...form}>
      <form
        id="shortcode-form-add"
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex h-full flex-col"
      >
        <Sheet
          open
          onOpenChange={(open) => {
            if (!open && !isPending) navigate('/shortcodes');
          }}
        >
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{__('Add New Shortcode', 'yay-bulk-order')}</SheetTitle>
              <SheetDescription>
                {__('Add a new shortcode to your site.', 'yay-bulk-order')}
              </SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-4 p-5">
              <div className="flex flex-col gap-2">
                <FormField
                  control={form.control}
                  name={`title`}
                  render={({ field: { ...field }, fieldState: { error, invalid } }) => (
                    <FormItem className="w-full gap-2.5">
                      <FormLabel className="text-foreground-400 text-xs font-medium">
                        {__('Title', 'yay-bulk-order')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ''}
                          placeholder={__('Shortcode Title', 'yay-bulk-order')}
                          className="h-9 rounded-md focus-visible:ring-0"
                          aria-invalid={invalid}
                        />
                      </FormControl>
                      {error && <FormMessage />}
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col gap-2">
                <FormField
                  control={form.control}
                  name="pattern"
                  render={({ field }) => (
                    <FormItem className="w-full gap-2.5">
                      <FormLabel className="text-foreground-400 text-xs font-medium">
                        {__('Pattern', 'yay-bulk-order')}
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                          className="flex flex-col gap-3"
                        >
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
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col gap-2">
                <ColumnOrder />
              </div>
            </div>

            <SheetFooter>
              <SheetClose asChild>
                <Button variant="outline">{__('Cancel', 'yay-bulk-order')}</Button>
              </SheetClose>
              <Button type="submit" form="shortcode-form-add" disabled={isPending}>
                {__('Create Shortcode', 'yay-bulk-order')}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </form>
    </FormProvider>
  );
}

const DEFAULT_SHORTCODE: ShortcodeConfigFormValues = {
  title: '',
  pattern: 'simple',
  columns: [
    'yay-bulk-order/column-product-title',
    'yay-bulk-order/column-product-price',
    'yay-bulk-order/column-product-stock',
    'yay-bulk-order/column-add-to-cart',
  ],
};
