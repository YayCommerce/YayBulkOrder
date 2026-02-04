import * as React from 'react';

import { cn } from '@/lib/utils';
import { focusVariants } from './variants/focus.variants';
import { inputVariants } from './variants/input.variants';

interface TextareaProps extends React.ComponentProps<'textarea'> {
  autoSize?: boolean;
}

function Textarea({ className, autoSize = false, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm font-normal shadow-xs transition-all outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30',
        autoSize && 'field-sizing-content',
        focusVariants(),
        inputVariants(),
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
