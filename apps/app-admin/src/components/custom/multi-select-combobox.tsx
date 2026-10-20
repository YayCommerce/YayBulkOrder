import { useState } from 'react';
import { __ } from '@wordpress/i18n';

import {
  ComboboxBadge,
  ComboboxCheckbox,
  ComboboxIcon,
  ComboboxRemove,
  ComboboxTrigger,
} from '@/components/ui/combobox';
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { Spinner } from '@/components/custom/spinner';

export type MultiSelectOption = {
  value: number;
  label: string;
};

type MultiSelectComboboxProps = {
  options: MultiSelectOption[];
  value: number[];
  onChange: (value: number[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  loading?: boolean;
  triggerClassName?: string;
};

export function MultiSelectCombobox({
  options,
  value,
  onChange,
  placeholder = __('Select...', 'yay-bulk-order'),
  searchPlaceholder = __('Search...', 'yay-bulk-order'),
  emptyText = __('No results found', 'yay-bulk-order'),
  loading = false,
  triggerClassName = 'min-w-45 max-w-75 sm:max-w-100',
}: MultiSelectComboboxProps) {
  const [open, setOpen] = useState(false);

  const toggle = (id: number) => onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);

  const labelOf = (id: number) => options.find((o) => o.value === id)?.label ?? String(id);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <ComboboxTrigger className={triggerClassName}>
        {value.length === 0 ? (
          <span className="text-muted-foreground text-sm">{placeholder}</span>
        ) : (
          <div className="flex flex-wrap gap-1 overflow-hidden">
            {value.map((id) => (
              <ComboboxBadge key={id}>
                {loading ? <Spinner /> : labelOf(id)}
                <ComboboxRemove onRemove={() => toggle(id)} />
              </ComboboxBadge>
            ))}
          </div>
        )}
        <ComboboxIcon />
      </ComboboxTrigger>
      <PopoverContent className="w-62 p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            {loading ? (
              <div className="flex justify-center py-6">
                <Spinner className="size-4" />
              </div>
            ) : (
              <>
                <CommandEmpty>{emptyText}</CommandEmpty>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value.toString()}
                    keywords={[String(option.value)]}
                    onSelect={() => toggle(option.value)}
                  >
                    <ComboboxCheckbox selected={value.includes(option.value)} />
                    {option.label}
                  </CommandItem>
                ))}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
