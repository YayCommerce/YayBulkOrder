import { GearIcon, HouseIcon, TableIcon } from '@phosphor-icons/react';
import { NavLink } from 'react-router';
import { __ } from '@wordpress/i18n';

import { HeaderNavMenuItem, HeaderNavMenuList } from '@/components/ui/navmenu-header';

export default function HeaderMenu() {
  return (
    <HeaderNavMenuList>
      <HeaderNavMenuItem asChild>
        <NavLink to="/dashboard">
          <HouseIcon weight="bold" />
          <span className="max-sm:hidden">{__('Dashboard', 'yay-bulk-order')}</span>
        </NavLink>
      </HeaderNavMenuItem>
      <HeaderNavMenuItem asChild>
        <NavLink to="/shortcodes">
          <TableIcon weight="bold" />
          <span className="max-sm:hidden">{__('Shortcodes', 'yay-bulk-order')}</span>
        </NavLink>
      </HeaderNavMenuItem>
      <HeaderNavMenuItem asChild>
        <NavLink to="/settings">
          <GearIcon weight="bold" />
          <span className="max-sm:hidden">{__('Settings', 'yay-bulk-order')}</span>
        </NavLink>
      </HeaderNavMenuItem>
    </HeaderNavMenuList>
  );
}
