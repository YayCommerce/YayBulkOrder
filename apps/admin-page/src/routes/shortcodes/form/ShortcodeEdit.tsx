import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { __ } from '@wordpress/i18n';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { useShortcodeQuery, useUpdateShortcodeMutation } from '@/lib/queries/shortcodes.queries';
import { ShortcodeFormValues, shortcodeSchema } from '@/lib/schemas/shortcodes.schema';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

export default function ShortcodeEdit({ editId }: { editId: number }) {
  const navigate = useNavigate();
  const { data } = useShortcodeQuery(editId);
  const { mutateAsync: updateShortcode, isPending } = useUpdateShortcodeMutation();
  const form = useForm<ShortcodeFormValues>({
    resolver: zodResolver(shortcodeSchema),
    defaultValues: data,
    mode: 'onChange',
  });

  async function onSubmit(values: ShortcodeFormValues) {
    console.log(values);
    await updateShortcode(values);
    navigate('/shortcodes');
  }

  useEffect(() => {
    if (data) {
      form.reset(data);
    }
  }, [data]);

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
