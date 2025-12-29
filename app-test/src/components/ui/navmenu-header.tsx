import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';

import { cn } from '@/lib/utils';

interface HeaderNavMenuListProps extends React.ComponentProps<'nav'> {
  asChild?: boolean;
}

const HeaderNavMenuList = React.forwardRef<HTMLDivElement, HeaderNavMenuListProps>(
  ({ className, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'nav';
    return (
      <Comp
        data-slot="header-navigation-menu-list"
        className={cn(
          'relative flex h-9 flex-1 list-none items-stretch justify-center gap-8',
          className,
        )}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);

interface HeaderNavMenuItemProps extends React.ComponentProps<'a'> {
  asChild?: boolean;
}

const HeaderNavMenuItem = React.forwardRef<HTMLAnchorElement, HeaderNavMenuItemProps>(
  ({ className, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'a';
    return (
      <Comp
        data-slot="header-navigation-menu-item"
        className={cn(
          'flex cursor-pointer items-center gap-1.5 border-b-3 border-solid border-transparent text-sm text-[#000000E0] transition-colors outline-none hover:border-[#e6e8eb] focus:ring-0',
          'aria-[current=page]:border-ring aria-[current=page]:text-ring',
          className,
        )}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);

export { HeaderNavMenuList, HeaderNavMenuItem };
