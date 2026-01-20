import { zodResolver } from '@hookform/resolvers/zod';
import { __ } from '@wordpress/i18n';
import { FieldErrors, FormProvider, SubmitErrorHandler, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { useCreateShortcodeMutation } from '@/lib/queries/shortcodes.queries';
import { createShortcodeSchema, CreateShortcodeValues } from '@/lib/schemas/shortcodes.schema';
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

const DEFAULT_SHORTCODE: CreateShortcodeValues = {
  title: '',
};

export default function ShortcodeNew() {
  const navigate = useNavigate();
  const { mutateAsync: createShortcode, isPending } = useCreateShortcodeMutation();

  const form = useForm<CreateShortcodeValues>({
    resolver: zodResolver(createShortcodeSchema),
    defaultValues: DEFAULT_SHORTCODE,
    mode: 'onChange',
  });

  async function onSubmit(values: CreateShortcodeValues) {
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
