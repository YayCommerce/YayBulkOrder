import { GearIcon, HouseIcon, TableIcon } from '@phosphor-icons/react';
import { __ } from '@wordpress/i18n';
import { NavLink, Outlet, Route, Routes } from 'react-router';

import { Button } from '@/components/ui/button';
import { HeaderNavMenuItem, HeaderNavMenuList } from '@/components/ui/navmenu-header';
import { Toaster } from '@/components/ui/sonner';

export default function Layout() {
  return (
    <>
      <div className="bg-background relative flex h-13.5 items-end justify-between gap-4 py-0 pr-3 sm:gap-5 lg:pr-6">
        <div className="flex aspect-square h-full items-center justify-center border-r">
          <img
            src={window.yayBulkOrderAdminData.path.assetsUrl + '/img/YayBulkOrder.svg'}
            alt="YayBulkOrder"
            className="size-8 rounded-sm"
          />
        </div>
        <HeaderNavMenuList>
          <HeaderNavMenuItem asChild>
            <NavLink to="/dashboard">
              <HouseIcon weight="bold" className="size-4" />
              <span className="max-sm:hidden">{__('Dashboard', 'yay-bulk-order')}</span>
            </NavLink>
          </HeaderNavMenuItem>
          <HeaderNavMenuItem asChild>
            <NavLink to="/shortcodes">
              <TableIcon weight="bold" className="size-4" />
              <span className="max-sm:hidden">{__('Shortcodes', 'yay-bulk-order')}</span>
            </NavLink>
          </HeaderNavMenuItem>
          <HeaderNavMenuItem asChild>
            <NavLink to="/settings">
              <GearIcon weight="bold" className="size-4" />
              <span className="max-sm:hidden">{__('Settings', 'yay-bulk-order')}</span>
            </NavLink>
          </HeaderNavMenuItem>
        </HeaderNavMenuList>

        <div className="flex h-full items-center gap-2">
          <Routes>
            <Route
              path="/settings"
              element={
                <Button variant="primary" type="submit" form="settings-form">
                  {__('Save Changes', 'yay-bulk-order')}
                </Button>
              }
            />
          </Routes>
        </div>
      </div>

      <div className="@container/main">
        <Outlet />
      </div>
      <Toaster />
    </>
  );
}
