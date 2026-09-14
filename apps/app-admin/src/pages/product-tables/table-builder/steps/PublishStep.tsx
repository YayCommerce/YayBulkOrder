import { ProductTableForm } from '@yay-bulk-order/common/src/schemas/product-tables.schema';
import { Controller, useFormContext } from 'react-hook-form';
import { useClipboard } from 'rooks';
import { toast } from 'sonner';
import { __ } from '@wordpress/i18n';

import { archiveProductTemplateUrl, newPageUrl, patternEditUrl } from '@/lib/helpers/wp.helper';
import { useCreateProductTablePatternMutation, useIsMutatingPatterns } from '@/lib/queries/blocks.queries';
import {
  useApplyToShopMutation,
  useCreateProductTableMutation,
  useIsMutatingProductTables,
  useStashNewPageBlocksMutation,
} from '@/lib/queries/product-table.queries';
import { Button, LoadingButton } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HelpTip } from '@/components/ui/tooltip';
import {
  makeBlockText,
  makeShortcodeWithId,
  makeShortcodeWithTable,
} from '@/pages/product-tables/product-tables.helper';

type PublishStepProps = {
  tableId: number;
};

export default function PublishStep({ tableId }: PublishStepProps) {
  const {
    control,
    getValues,
    formState: { isDirty },
  } = useFormContext<ProductTableForm>();
  const { copy } = useClipboard();
  const isFormSaved = !isDirty && tableId > 0;

  const { isPending: isSaving } = useCreateProductTableMutation();
  const createPatternMutation = useCreateProductTablePatternMutation(tableId);
  const stashPageBlocksMutation = useStashNewPageBlocksMutation();
  const applyToShopMutation = useApplyToShopMutation();
  const isMutatingPattern = useIsMutatingPatterns();
  const isMutatingProductTable = useIsMutatingProductTables();

  const createTablePattern = async () => {
    if (isMutatingPattern) return;
    try {
      const table = getValues();
      const data = await createPatternMutation.mutateAsync({
        title: table.title,
        content: makeBlockText(table, tableId),
      });
      const patternId = data.id;

      toast.success(__('Pattern created successfully.', 'yay-bulk-order'));
      window.open(patternEditUrl(patternId));
    } catch (err) {
      console.error(err);
      toast.error(__('Cannot create this table pattern', 'yay-bulk-order'));
    }
  };

  const addNewPage = async () => {
    if (isMutatingProductTable) return;
    try {
      const table = getValues();
      await stashPageBlocksMutation.mutateAsync(makeBlockText(table, tableId));
      window.open(newPageUrl());
    } catch (err) {
      console.error(err);
      toast.error(__('Could not open the page editor', 'yay-bulk-order'));
    }
  };

  const copyAsBlock = async () => {
    const table = getValues();
    try {
      await copy(makeBlockText(table, tableId));
      toast.success(__('Copied', 'yay-bulk-order'));
    } catch (err) {
      console.log(err);
      toast.error(__('Cannot Copy', 'yay-bulk-order'));
    }
  };

  const copyAsShortcode = async () => {
    try {
      if (isFormSaved) {
        await copy(makeShortcodeWithId(tableId));
      } else {
        const table = getValues();
        await copy(makeShortcodeWithTable(table));
      }
      toast.success(__('Copied', 'yay-bulk-order'));
    } catch (err) {
      console.log(err);
      toast.error(__('Cannot Copy', 'yay-bulk-order'));
    }
  };

  const openCatalogTemplateEditor = () => {
    const url = archiveProductTemplateUrl();
    if (url) {
      window.open(url);
    }
  };

  const applyToShop = async () => {
    if (isMutatingProductTable) return;

    if (!isBlockTheme) {
      if (!isFormSaved) {
        toast.error(__('Save the table before using it in Shop/Category pages.', 'yay-bulk-order'));
        return;
      }

      try {
        await applyToShopMutation.mutateAsync(tableId);
        toast.success(__('Applied to Shop/Category page.', 'yay-bulk-order'));
        window.open(shopPageUrl);
      } catch (err) {
        console.error(err);
        toast.error(__('Could not apply the table to Shop/Category pages.', 'yay-bulk-order'));
      }
    }
  };

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
                  disabled={isSaving || isFormSaved}
                >
                  {isFormSaved ? __('Saved', 'yay-bulk-order') : __('Save for later', 'yay-bulk-order')}
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
            {isBlockTheme && (
              <PublishOption
                title={__('Create Pattern', 'yay-bulk-order')}
                description={__('Publish the table as a reusable block pattern to the Library.', 'yay-bulk-order')}
                onClick={createTablePattern}
                disabled={createPatternMutation.isPending}
              />
            )}
            {isBlockTheme ? (
              <PublishOption
                title={__('Open in Catalog Template Editor', 'yay-bulk-order')}
                description={__(
                  'Go to Catalog Template Editor and manually custom the template for Shop / Category page.',
                  'yay-bulk-order',
                )}
                onClick={openCatalogTemplateEditor}
              />
            ) : (
              <PublishOption
                title={__('Use in Shop/Category Page', 'yay-bulk-order')}
                description={__(
                  'Use the table in shop or category pages. This will replace the default product table.',
                  'yay-bulk-order',
                )}
                onClick={applyToShop}
                disabled={applyToShopMutation.isPending}
              />
            )}

            <PublishOption
              title={__('Copy as Blocks', 'yay-bulk-order')}
              description={__('Copy the table as blocks to use in the editor.', 'yay-bulk-order')}
              onClick={copyAsBlock}
            />
            <PublishOption
              title={__('Copy as Shortcode', 'yay-bulk-order')}
              description={__('Copy the table as a shortcode to use in the editor.', 'yay-bulk-order')}
              onClick={copyAsShortcode}
            />
            <PublishOption
              title={__('Add new Page', 'yay-bulk-order')}
              description={__('Create a new page with the table.', 'yay-bulk-order')}
              onClick={addNewPage}
              disabled={stashPageBlocksMutation.isPending}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

type PublishOptionProps = {
  title: string;
  description: string;
  onClick?: () => void;
  disabled?: boolean;
};

function PublishOption({ title, description, onClick, disabled }: PublishOptionProps) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      disabled={disabled}
      className="h-auto min-h-20 flex-col items-start justify-start gap-1 whitespace-normal px-2.5 py-2 text-left"
    >
      <span className="text-sm font-medium">{title}</span>
      <span className="text-muted-foreground text-xs font-normal">{description}</span>
    </Button>
  );
}

const { isBlockTheme, shopPageUrl } = window.yayBulkOrderMeta.wpMeta;
