import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

function Spinner({ className, ...props }: React.ComponentProps<typeof Loader2>) {
  return (
    <Loader2
      role="status"
      aria-label="Loading"
      data-slot="spinner"
      className={cn('text-muted-foreground size-5 animate-spin', className)}
      {...props}
    />
  );
}

export { Spinner };
