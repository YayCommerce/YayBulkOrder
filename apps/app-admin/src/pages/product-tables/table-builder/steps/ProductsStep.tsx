import { useState } from 'react';
import { ProductTable } from '@yay-bulk-order/common/src/schemas';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { __ } from '@wordpress/i18n';

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
import { BuilderStepsProps } from '@/pages/product-tables/table-builder/table-builder.helper';

export default function ProductsStep({ setSteps }: BuilderStepsProps) {
  const { control } = useFormContext<ProductTable>();
  const queryBy = useWatch({ control, name: 'query.queryBy' });

  const [comboOpen, setComboOpen] = useState(false);

  return (
    <Card className="w-2xl max-w-2xl">
      <CardHeader>
        <CardTitle className="text-base font-medium">{__('Select products to display', 'yay-bulk-order')}</CardTitle>
        <CardDescription>{__('Choose which products appear in the table.', 'yay-bulk-order')}</CardDescription>
      </CardHeader>
      <div className="flex min-h-60 flex-col gap-5">
        <Controller
          control={control}
          name="query.queryBy"
          render={({ field }) => (
            <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="all" id="query-all" />
                <Label htmlFor="query-all">{__('All products', 'yay-bulk-order')}</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="categories" id="query-categories" />
                <Label htmlFor="query-categories">{__('By categories', 'yay-bulk-order')}</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="featured" id="query-featured" />
                <Label htmlFor="query-featured">{__('Featured products', 'yay-bulk-order')}</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="sale" id="query-sale" />
                <Label htmlFor="query-sale">{__('On sale products', 'yay-bulk-order')}</Label>
              </div>
            </RadioGroup>
          )}
        />

        {queryBy === 'categories' && (
          <Controller
            control={control}
            name="query.categories"
            render={({ field }) => {
              const selectedCatIds = field.value ?? [];
              const toggleCategory = (id: string) =>
                field.onChange(
                  selectedCatIds.includes(id)
                    ? selectedCatIds.filter((catId) => catId !== id)
                    : [...selectedCatIds, id],
                );

              return (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs">{__('Categories:', 'yay-bulk-order')}</span>
                  <Popover open={comboOpen} onOpenChange={setComboOpen}>
                    <ComboboxTrigger className="min-w-45 max-w-75 sm:max-w-100">
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
              );
            }}
          />
        )}
      </div>
      <div className="flex items-center justify-center gap-4 border-t pt-6">
        <Button variant="primary" size="sm" onClick={() => setSteps('columns')}>
          {__('Next', 'yay-bulk-order')}
        </Button>
      </div>
    </Card>
  );
}

const { categories } = window.yayBulkOrderMeta.wcMeta;
