import { ProductTable } from '@yay-bulk-order/common/src/schemas';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { __ } from '@wordpress/i18n';

import { useIsMutatingProductTables } from '@/lib/queries/product-table.queries';
import { LoadingButton } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HelpTip } from '@/components/ui/tooltip';

export default function PublishStep() {
  const { control } = useFormContext<ProductTable>();
  const isSaving = useIsMutatingProductTables();
  const isSaved = (useWatch({ control, name: 'id' }) ?? 0) > 0;

  return (
    <Card className="w-2xl max-w-2xl">
      <CardHeader>
        <CardTitle className="text-base font-medium">{__('Publish table', 'yay-bulk-order')}</CardTitle>
        <CardDescription>{__('Give it a name and choose how to publish it.', 'yay-bulk-order')}</CardDescription>
      </CardHeader>
      <div className="flex min-h-60 flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="table-title">{__('Table Title', 'yay-bulk-order')}</Label>
          <div className="flex items-center gap-2">
            <Controller
              control={control}
              name="title"
              render={({ field }) => (
                <Input id="table-title" {...field} value={field.value ?? ''} className="max-w-72" />
              )}
            />
            <HelpTip
              trigger={
                <LoadingButton
                  type="submit"
                  form="product-table-form"
                  loading={isSaving}
                  disabled={isSaving || isSaved}
                >
                  {isSaved ? __('Saved', 'yay-bulk-order') : __('Save for later', 'yay-bulk-order')}
                </LoadingButton>
              }
              content={<div>{__('Save to Table List to reuse', 'yay-bulk-order')}</div>}
            ></HelpTip>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
            {__('Publish options', 'yay-bulk-order')}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="border-border hover:bg-accent hover:text-accent-foreground flex cursor-pointer flex-col gap-1 rounded-md border p-3 transition-all">
              <Label>{__('Create Pattern', 'yay-bulk-order')}</Label>
              <p className="text-muted-foreground text-xs">
                {__('Publish the table as a reusable block pattern to the Library.', 'yay-bulk-order')}
              </p>
            </div>
            <div className="border-border hover:bg-accent hover:text-accent-foreground min-h-18 flex cursor-pointer flex-col gap-1 rounded-md border p-3 transition-all">
              <Label>{__('Use in Shop/Category Page', 'yay-bulk-order')}</Label>
              <p className="text-muted-foreground text-xs">
                {__(
                  'Use the table in shop or category pages. This will replace the default product table.',
                  'yay-bulk-order',
                )}
              </p>
            </div>
            <div className="border-border hover:bg-accent hover:text-accent-foreground min-h-18 flex cursor-pointer flex-col gap-1 rounded-md border p-3 transition-all">
              <Label>{__('Copy as Blocks', 'yay-bulk-order')}</Label>
              <p className="text-muted-foreground text-xs">
                {__('Copy the table as blocks to use in the editor.', 'yay-bulk-order')}
              </p>
            </div>
            <div className="border-border hover:bg-accent hover:text-accent-foreground min-h-18 flex cursor-pointer flex-col gap-1 rounded-md border p-3 transition-all">
              <Label>{__('Copy as Shortcode', 'yay-bulk-order')}</Label>
              <p className="text-muted-foreground text-xs">
                {__('Copy the table as a shortcode to use in the editor.', 'yay-bulk-order')}
              </p>
            </div>
            <div className="border-border hover:bg-accent hover:text-accent-foreground min-h-18 flex cursor-pointer flex-col gap-1 rounded-md border p-3 transition-all">
              <Label>{__('Add new Page', 'yay-bulk-order')}</Label>
              <p className="text-muted-foreground text-xs">
                {__('Create a new page with the table.', 'yay-bulk-order')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
