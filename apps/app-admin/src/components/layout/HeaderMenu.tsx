import { ComponentProps } from 'react';
import { NavLink } from 'react-router';
import { __ } from '@wordpress/i18n';

import { cn } from '@/lib/utils';
import { HeaderNavMenuItem, HeaderNavMenuList } from '@/components/ui/navmenu-header';
import DashboardIcon from '@/components/icons/DashboardIcon';
import RequestIcon from '../icons/RequestIcon';
import SettingsIcon from '../icons/SettingsIcon';

export function HeaderMenu() {
  return (
    <HeaderNavMenuList>
      <CustomMenuItem asChild key="home">
        <NavLink to="/home">
          <DashboardIcon className="stroke-2" />
          <span>{__('Home', 'yay-bulk-order')}</span>
        </NavLink>
      </CustomMenuItem>
      <CustomMenuItem asChild key="product-tables">
        <NavLink to="/product-tables">
          <RequestIcon className="stroke-2" />
          <span>{__('Product Tables', 'yay-bulk-order')}</span>
        </NavLink>
      </CustomMenuItem>
      <CustomMenuItem asChild key="settings">
        <NavLink to="/settings">
          <SettingsIcon className="stroke-2" />
          <span>{__('Settings', 'yay-bulk-order')}</span>
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
