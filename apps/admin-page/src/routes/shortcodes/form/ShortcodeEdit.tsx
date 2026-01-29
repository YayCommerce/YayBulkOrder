import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { __ } from '@wordpress/i18n';

import { useShortcodeQuery, useUpdateShortcodeMutation } from '@/lib/queries/shortcodes.queries';
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

export default function ShortcodeEdit({ editId }: { editId: number }) {
  const navigate = useNavigate();
  const { data } = useShortcodeQuery(editId);
  const { mutateAsync: updateShortcode, isPending } = useUpdateShortcodeMutation();

  const form = useForm<ShortcodeConfigFormValues>({
    resolver: zodResolver(shortcodeConfigFormSchema),
    defaultValues: data,
    mode: 'onSubmit',
  });

  async function onSubmit(values: ShortcodeConfigFormValues) {
    console.log(values);
    await updateShortcode({ shortcodeId: editId, payload: values });
    navigate('/shortcodes');
  }

  useEffect(() => {
    if (data) {
      form.reset(data);
    }
  }, [data, form]);

  return (
    <FormProvider {...form}>
      <form
        id="shortcode-form-edit"
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
              <SheetTitle>{__('Edit Shortcode', 'yay-bulk-order')}</SheetTitle>
              <SheetDescription>
                {__('Edit the shortcode details.', 'yay-bulk-order')}
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
                            <RadioGroupItem value="simple" id="pattern-simple-edit" />
                            <label
                              htmlFor="pattern-simple-edit"
                              className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {__('Simple', 'yay-bulk-order')}
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="filterable" id="pattern-filterable-edit" />
                            <label
                              htmlFor="pattern-filterable-edit"
                              className="text-sm leading-none font-medium peer-disabled:opacity-70"
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
              <Button form="shortcode-form-edit" type="submit" disabled={isPending}>
                {__('Update Shortcode', 'yay-bulk-order')}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </form>
    </FormProvider>
  );
}
