import * as React from 'react';
import { InputHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';
import { focusVariants } from './variants/focus.variants';
import { inputVariants } from './variants/input.variants';

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'flex h-9 w-full min-w-0 rounded-sm border border-input bg-transparent p-2 pl-3 text-base shadow-xs transition-all outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus:shadow-none focus-visible:shadow-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30',
        focusVariants(),
        inputVariants({ variant: 'input' }),
        className,
      )}
      {...props}
      ref={ref}
    />
  );
});

export { Input };
export type { InputProps };
