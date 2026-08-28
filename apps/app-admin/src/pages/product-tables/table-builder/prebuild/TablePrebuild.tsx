import { useState } from 'react';
import { Popover } from '@radix-ui/react-popover';

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
import { BuilderStepsProps, prebuildTemplates } from '@/pages/product-tables/table-builder/TableBuilder.helper';

export default function TablePrebuild({ setSteps }: BuilderStepsProps) {
  const [selected, setSelected] = useState({
    slug: prebuildTemplates[0].slug,
    data: prebuildTemplates[0].data,
  });

  const [comboOpen, setComboOpen] = useState(false);
  const [selectedCatIds, setSelectedCatIds] = useState<string[]>([]);

  const toggleCategory = (id: string) => {
    setSelectedCatIds((prev) => (prev.includes(id) ? prev.filter((catId) => catId !== id) : [...prev, id]));
  };

  return (
    <div className="mx-auto flex h-full max-w-6xl flex-col justify-center gap-4">
      <p className="text-muted-foreground mb-4 text-center text-base">Choose a template to get started</p>

      <div className="mx-auto grid w-full grid-cols-[1fr_3fr] gap-4">
        {/* Left: template selection */}
        <div className="flex flex-col gap-2">
          {prebuildTemplates.map(({ slug, data, title, desc }) => (
            <button
              key={slug}
              onClick={() => setSelected({ slug, data })}
              className={cn(
                'border-border flex cursor-pointer flex-col items-start gap-1 rounded-md border p-3 text-left transition-colors',
                slug === selected.slug ? 'border-primary bg-primary/5' : 'hover:bg-muted/50',
              )}
            >
              <span className="text-sm font-medium">{title}</span>
              <span className="text-muted-foreground text-xs">{desc}</span>
            </button>
          ))}
        </div>

        {/* Right: preview + footer */}
        <div className="border-border flex flex-col overflow-hidden rounded-md border">
          <TablePreview template={selected.data} />

          <div className="border-border flex flex-wrap items-center gap-3 border-t px-4 py-3">
            {selected.slug === 'some-categories' && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs">Categories:</span>
                <Popover open={comboOpen} onOpenChange={setComboOpen}>
                  <ComboboxTrigger className="min-w-45 max-w-70">
                    {selectedCatIds.length === 0 ? (
                      <span className="text-muted-foreground text-sm">Select...</span>
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
                          <CommandItem key={cat.id} value={cat.id} onSelect={() => toggleCategory(cat.id)}>
                            <ComboboxCheckbox selected={selectedCatIds.includes(cat.id)} />
                            {cat.title}
                          </CommandItem>
                        ))}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            )}

            <div className="ml-auto flex gap-2">
              <HelpTip
                trigger={
                  <Button variant="outline" size="sm" onClick={() => setSteps('products')}>
                    Build from this template
                  </Button>
                }
                content="Continue to further edit steps"
              />
              <HelpTip
                trigger={<Button size="sm">Create from this template</Button>}
                content="Skip editing and go straight to the last step"
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
              Create from scratch
            </button>
          }
          content="Start with a blank table and configure everything yourself"
        />
      </div>
    </div>
  );
}

const { categories } = window.yayBulkOrderMeta.wcMeta;
