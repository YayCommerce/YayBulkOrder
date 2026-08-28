import { useState } from 'react';
import { ProductTable } from '@yay-bulk-order/common/src/schemas';

import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ComboboxBadge,
  ComboboxCheckbox,
  ComboboxIcon,
  ComboboxRemove,
  ComboboxTrigger,
} from '@/components/ui/combobox';
import { Command, CommandItem, CommandList } from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { BuilderStepsProps } from '@/pages/product-tables/table-builder/TableBuilder.helper';

export default function ProductsStep({ setSteps }: BuilderStepsProps) {
  const [queryBy, setQueryBy] = useState<ProductTable['query']['queryBy']>('all');
  const [comboOpen, setComboOpen] = useState(false);
  const [selectedCatIds, setSelectedCatIds] = useState<string[]>([]);
  const toggleCategory = (id: string) => {
    setSelectedCatIds((prev) => (prev.includes(id) ? prev.filter((catId) => catId !== id) : [...prev, id]));
  };

  return (
    <div className="mx-auto flex h-full max-w-6xl flex-col justify-center gap-4">
      <Card className="w-2xl max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base font-medium">Select products to display</CardTitle>
          <CardDescription>Choose which products appear in the table.</CardDescription>
        </CardHeader>
        <div className="flex min-h-60 flex-col gap-5">
          <RadioGroup
            value={queryBy}
            onValueChange={(v) => setQueryBy(v as ProductTable['query']['queryBy'])}
            className="flex flex-col gap-3"
          >
            {[
              { value: 'all', label: 'All products' },
              { value: 'categories', label: 'By categories' },
              { value: 'featured', label: 'Featured products' },
              { value: 'sale', label: 'On sale products' },
            ].map(({ value, label }) => (
              <div key={value} className="flex items-center gap-2">
                <RadioGroupItem value={value} id={`query-${value}`} />
                <Label htmlFor={`query-${value}`}>{label}</Label>
              </div>
            ))}
          </RadioGroup>

          {queryBy === 'categories' && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs">Categories:</span>
              <Popover open={comboOpen} onOpenChange={setComboOpen}>
                <ComboboxTrigger className="min-w-45 max-w-75 sm:max-w-100">
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
        </div>
        <div className="flex items-center justify-center gap-4 border-t pt-6">
          <Button variant="primary" size="sm" onClick={() => setSteps('columns')}>
            Next
          </Button>
        </div>
      </Card>
    </div>
  );
}

const { categories } = window.yayBulkOrderMeta.wcMeta;
