import { XIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from './button';

type BulkActionBoxProps = {
  selected: number;
  onClose: () => void;
  children?: React.ReactNode;
  className?: string;
};

const BulkActionBox = ({ selected, onClose, children, className }: BulkActionBoxProps) => {
  return (
    <>
      <div
        className={cn(
          'items-center gap-2 rounded-md border border-input px-1.5 py-1 shadow-sm',
          selected > 1 ? 'flex' : 'hidden',
          className,
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
          onClick={() => {
            onClose();
          }}
        >
          <XIcon className="size-4" />
        </Button>
        {children}
      </div>
    </>
  );
};

export { BulkActionBox };
