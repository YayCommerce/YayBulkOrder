import { useState } from 'react';
import { Popover } from '@radix-ui/react-popover';
import { ProductTableForm } from '@yay-bulk-order/common/src/schemas/product-tables.schema';
import { useFormContext } from 'react-hook-form';
import { __ } from '@wordpress/i18n';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  ComboboxBadge,
  ComboboxCheckbox,
  ComboboxIcon,
  ComboboxRemove,
  ComboboxTrigger,
} from '@/components/ui/combobox';
import { Command, CommandItem, CommandList } from '@/components/ui/command';
import { PopoverContent } from '@/components/ui/popover';
import { HelpTip } from '@/components/ui/tooltip';
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

  const [comboOpen, setComboOpen] = useState(false);
  const [selectedCatIds, setSelectedCatIds] = useState<number[]>([]);
  const [catError, setCatError] = useState('');

  const { reset } = useFormContext<ProductTableForm>();

  const toggleCategory = (id: number) => {
    setCatError('');
    setSelectedCatIds((prev) => (prev.includes(id) ? prev.filter((catId) => catId !== id) : [...prev, id]));
  };

  const applyTemplate = (nextStep: BuilderSteps) => {
    if (nextStep !== 'products') {
      if (selected.data.query.queryBy === 'by-categories' && selectedCatIds.length === 0) {
        setCatError(__('Select at least one category', 'yay-bulk-order'));
        return;
      }
    }
    reset({
      ...selected.data,
      query:
        selected.data.query.queryBy === 'by-categories'
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
                  <Popover open={comboOpen} onOpenChange={setComboOpen}>
                    <ComboboxTrigger className="min-w-45 max-w-70">
                      {selectedCatIds.length === 0 ? (
                        <span className="text-muted-foreground text-sm">{__('Select...', 'yay-bulk-order')}</span>
                      ) : (
                        <div className="flex flex-wrap gap-1 overflow-hidden">
                          {selectedCatIds.map((id) => (
                            <ComboboxBadge key={id}>
                              {categories.find((cat) => cat.id === id)?.title ?? id}
                              <ComboboxRemove onRemove={() => toggleCategory(id)} />
                            </ComboboxBadge>
                          ))}
                        </div>
                      )}
                      <ComboboxIcon />
                    </ComboboxTrigger>
                    <PopoverContent className="w-52 p-0" align="start">
                      <Command>
                        <CommandList>
                          {categories.map((cat) => (
                            <CommandItem key={cat.id} value={cat.id.toString()} onSelect={() => toggleCategory(cat.id)}>
                              <ComboboxCheckbox selected={selectedCatIds.includes(cat.id)} />
                              {cat.title}
                            </CommandItem>
                          ))}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                {catError && <p className="text-destructive text-xs">{catError}</p>}
              </div>
            )}

            <div className="ml-auto flex gap-2">
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
