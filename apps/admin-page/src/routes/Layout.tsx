import { CircleNotchIcon, GearIcon, HouseIcon, TableIcon } from '@phosphor-icons/react';
import { useIsMutating } from '@tanstack/react-query';
import { NavLink, Outlet, Route, Routes } from 'react-router';
import { __ } from '@wordpress/i18n';

import { Button } from '@/components/ui/button';
import { HeaderNavMenuItem, HeaderNavMenuList } from '@/components/ui/navmenu-header';
import { Toaster } from '@/components/ui/sonner';

export default function Layout() {
  const isSavingSettings = useIsMutating({ mutationKey: ['settings'] }) > 0;
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
              path="/settings/:subMenu"
              element={
                <Button
                  type="submit"
                  form="settings-form"
                  disabled={isSavingSettings}
                  className="relative cursor-pointer"
                >
                  <span className={isSavingSettings ? 'opacity-0' : 'opacity-100'}>
                    {__('Save Changes', 'yay-bulk-order')}
                  </span>
                  {isSavingSettings && (
                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <CircleNotchIcon className="animate-spin" />
                    </span>
                  )}
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
