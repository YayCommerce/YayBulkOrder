import * as React from 'react';

import { cn } from '@/lib/utils';

import { inputVariants } from './variants/input.variants';

interface TextareaProps extends React.ComponentProps<'textarea'> {
  autoSize?: boolean;
}

function Textarea({ className, autoSize = false, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'border-input placeholder:text-muted-foreground dark:bg-input/30 flex min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-sm font-normal shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        autoSize && 'field-sizing-content',
        inputVariants(),
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
