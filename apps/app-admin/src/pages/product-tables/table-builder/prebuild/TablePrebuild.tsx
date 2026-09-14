import { useMemo, useState } from 'react';
import { ProductTableForm } from '@yay-bulk-order/common/src/schemas/product-tables.schema';
import { useFormContext } from 'react-hook-form';
import { __ } from '@wordpress/i18n';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { HelpTip } from '@/components/ui/tooltip';
import { MultiSelectCombobox, MultiSelectOption } from '@/components/custom/multi-select-combobox';
import { UpgradeToProButton } from '@/components/custom/upgrate-to-pro';
import { TablePreview } from '@/pages/product-tables/table-builder/prebuild/TablePreview';
import {
  BuilderSteps,
  BuilderStepsProps,
  PREBUILD_TEMPLATES,
} from '@/pages/product-tables/table-builder/table-builder.helper';

export default function TablePrebuild({ setSteps }: BuilderStepsProps) {
  const [selected, setSelected] = useState({
    slug: PREBUILD_TEMPLATES[0].slug,
    data: PREBUILD_TEMPLATES[0].data,
  });

  const [selectedCatIds, setSelectedCatIds] = useState<number[]>([]);
  const [catError, setCatError] = useState('');

  const proTemplate = useMemo(
    () => PREBUILD_TEMPLATES.filter((t) => t.isProTemplate).map((t) => t.slug),
    [PREBUILD_TEMPLATES],
  );

  const { reset } = useFormContext<ProductTableForm>();

  const categoryOptions: MultiSelectOption[] = useMemo(
    () => categories.map((cat) => ({ value: cat.id, label: cat.title })),
    [],
  );

  const handleCategoryChange = (ids: number[]) => {
    setCatError('');
    setSelectedCatIds(ids);
  };

  const applyTemplate = (nextStep: BuilderSteps) => {
    if (nextStep !== 'products') {
      if (selected.data.query.queryBy === 'by-category' && selectedCatIds.length === 0) {
        setCatError(__('Select at least one category', 'yay-bulk-order'));
        return;
      }
    }
    reset({
      ...selected.data,
      query:
        selected.data.query.queryBy === 'by-category'
          ? { ...selected.data.query, categories: selectedCatIds }
          : selected.data.query,
    });
    setSteps(nextStep);
  };

  return (
    <div className="mx-auto flex flex-col justify-center gap-4">
      <p className="text-muted-foreground mb-4 text-center text-base">
        {__('Choose a template to get started', 'yay-bulk-order')}
      </p>

      <div className="mx-auto grid w-full grid-cols-[1fr_3fr] gap-4">
        {/* Left: template selection */}
        <div className="flex flex-col gap-2">
          {PREBUILD_TEMPLATES.map(({ slug, data, title, desc }) => (
            <div
              key={slug}
              onClick={() => setSelected({ slug, data })}
              className={cn(
                'border-border flex cursor-pointer flex-col items-start gap-1 rounded-md border p-3 text-left transition-colors',
                slug === selected.slug ? 'border-primary bg-primary/5' : 'hover:bg-muted/50',
              )}
            >
              <span className="text-sm font-medium">{title}</span>
              <span className="text-muted-foreground text-xs">{desc}</span>
            </div>
          ))}
        </div>

        {/* Right: preview + footer */}
        <div className="border-border flex flex-col overflow-hidden rounded-md border">
          <TablePreview template={selected.data} />

          <div className="border-border flex flex-wrap items-center gap-3 border-t px-4 py-3">
            {selected.slug === 'some-categories' && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs">{__('Categories:', 'yay-bulk-order')}</span>
                  <MultiSelectCombobox
                    options={categoryOptions}
                    value={selectedCatIds}
                    onChange={handleCategoryChange}
                    searchPlaceholder={__('Search categories...', 'yay-bulk-order')}
                    emptyText={__('No categories found', 'yay-bulk-order')}
                  />
                </div>
                {catError && <p className="text-destructive text-xs">{catError}</p>}
              </div>
            )}
            <div className="ml-auto flex gap-2">
              {proTemplate.includes(selected.slug) ? (
                <UpgradeToProButton />
              ) : (
                <>
                  <HelpTip
                    trigger={
                      <Button variant="outline" size="sm" onClick={() => applyTemplate('products')}>
                        {__('Build from this template', 'yay-bulk-order')}
                      </Button>
                    }
                    content={__('Continue to further edit steps', 'yay-bulk-order')}
                  />
                  <HelpTip
                    trigger={
                      <Button size="sm" onClick={() => applyTemplate('publish')}>
                        {__('Create from this template', 'yay-bulk-order')}
                      </Button>
                    }
                    content={__('Skip editing and go straight to the last step', 'yay-bulk-order')}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create from scratch link */}
      <div className="max-w-250 mx-auto mt-4 w-full text-center">
        <HelpTip
          trigger={
            <button
              className="text-primary cursor-pointer text-sm hover:underline"
              onClick={() => setSteps('products')}
            >
              {__('Create from scratch', 'yay-bulk-order')}
            </button>
          }
          content={__('Start with a blank table and configure everything yourself', 'yay-bulk-order')}
        />
      </div>
    </div>
  );
}

const { categories } = window.yayBulkOrderMeta.wcMeta;
