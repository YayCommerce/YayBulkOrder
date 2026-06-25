import { ComponentProps } from 'react';
import { NavLink } from 'react-router';
import { __ } from '@wordpress/i18n';

import { cn } from '@/lib/utils';
import { HeaderNavMenuItem, HeaderNavMenuList } from '@/components/ui/navmenu-header';
import DashboardIcon from '@/components/icons/DashboardIcon';

export function HeaderMenu() {
  return (
    <HeaderNavMenuList>
      <CustomMenuItem asChild key="dashboard">
        <NavLink to="/dashboard">
          <DashboardIcon className="stroke-2" />
          <span>{__('Dashboard', 'yay-bulk-order')}</span>
        </NavLink>
      </CustomMenuItem>
    </HeaderNavMenuList>
  );
}

function CustomMenuItem({ className, ...props }: ComponentProps<typeof HeaderNavMenuItem>) {
  return (
    <HeaderNavMenuItem
      className={cn(
        'max-md:flex-col sm:max-md:px-3',
        'sm:max-md:pt-2',
        '*:[svg]:size-4 sm:*:[svg]:size-3.5 md:*:[svg]:size-4',
        'max-sm:*:[span]:hidden max-md:text-xs',
        className,
      )}
      {...props}
    />
  );
}
