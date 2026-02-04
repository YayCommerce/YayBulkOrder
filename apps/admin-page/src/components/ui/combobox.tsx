import * as React from 'react';
import { CheckIcon, XIcon } from '@phosphor-icons/react';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PopoverTrigger } from '@/components/ui/popover';
import { Badge } from './badge';
import { inputVariants } from './variants/input.variants';

function ComboboxTrigger({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: React.ReactNode;
} & React.ComponentProps<typeof Button>) {
  return (
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        role="combobox"
        className={cn(
          'h-auto min-h-9 w-fit min-w-[300px] justify-between px-2 py-1 font-normal [&_svg:not([class*="text-"])]:text-muted-foreground [&_svg:not([class*="text-"])]:transition-colors',
          inputVariants({ variant: 'picker' }),
          className,
        )}
        {...props}
      >
        {children}
      </Button>
    </PopoverTrigger>
  );
}

function ComboboxBadge({ label, onRemove }: { label: string; onRemove: (e: React.MouseEvent) => void }) {
  return (
    <Badge variant="muted" className="h-6.5 rounded-sm bg-muted-400 text-foreground [&>svg]:pointer-events-auto">
      {label}
      <XIcon
        onMouseDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onRemove(e);
        }}
        className="size-3.5 text-muted-foreground hover:text-destructive"
        weight="bold"
      />
    </Badge>
  );
}

function ComboboxIcon({ className }: { className?: string }) {
  return <ChevronDown className={cn('size-4', className)} />;
}

function ComboboxCheckbox({ selected }: { selected: boolean }) {
  return (
    <div
      className="pointer-events-none size-4 shrink-0 rounded-[4px] border border-input transition-all select-none data-[selected=true]:border-primary data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground *:[svg]:opacity-0 data-[selected=true]:*:[svg]:opacity-100"
      data-selected={selected}
    >
      <CheckIcon className="size-3.5 text-current" />
    </div>
  );
}

export { ComboboxTrigger, ComboboxBadge, ComboboxIcon, ComboboxCheckbox };
