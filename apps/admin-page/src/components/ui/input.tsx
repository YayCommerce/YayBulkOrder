import * as React from 'react';

import { cn } from '@/lib/utils';

import { inputVariants } from './variants/input.variants';

// using react forward ref and using function, not component
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        data-slot="input"
        className={cn(
          'file:text-foreground focus-visible:border-foreground focus-visible:hover:border-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input hover:border-foreground flex h-9 w-full min-w-0 rounded-sm border bg-transparent p-2 pl-3 text-base shadow-xs transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium focus:shadow-none focus-visible:shadow-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          inputVariants(),
          className,
        )}
        {...props}
        ref={ref}
      />
    );
  },
);

export { Input };
