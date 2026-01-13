import { __ } from '@wordpress/i18n';
import { NavLink, Outlet } from 'react-router';

import { Button } from '@/components/ui/button';
import { HeaderNavMenuItem, HeaderNavMenuList } from '@/components/ui/navmenu-header';
import { Toaster } from '@/components/ui/sonner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import DocumentIcon from '@/components/icons/DocumentIcon';
import HeadsetIcon from '@/components/icons/HeadsetIcon';
import SettingIcon from '@/components/icons/SettingIcon';

export default function Layout() {
  return (
    <>
      <Toaster />
      <div className="bg-background relative flex h-[54px] items-end justify-between gap-4 py-0 pr-3 sm:gap-5 lg:pr-6">
        <div className="flex h-full items-center border-r p-2.5">
          <img
            src={window.yayBulkOrderData.assetsUrl + '/img/YayBulkOrder.svg'}
            alt="YayBulkOrder"
            className="w-7.5 rounded-sm"
          />
        </div>
        <HeaderNavMenuList className="h-full justify-start gap-1.5 md:gap-7.5">
          <HeaderNavMenuItem asChild className="group">
            <NavLink to="/bulk-order-tables" className="px-3">
              <SettingIcon className="group-aria-[current=page]:text-ring" />
              <span className="hidden sm:inline">{__('Product Tables', 'yay-bulk-order')}</span>
            </NavLink>
          </HeaderNavMenuItem>
          <HeaderNavMenuItem asChild className="group">
            <NavLink to="/customize" className="px-3">
              <SettingIcon className="group-aria-[current=page]:text-ring" />
              <span className="hidden sm:inline">{__('Design', 'yay-bulk-order')}</span>
            </NavLink>
          </HeaderNavMenuItem>
        </HeaderNavMenuList>
        <div className="flex h-full items-center gap-1.5 md:gap-5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={() => window.open('https://yaycommerce.com/support/', '_blank')}
              >
                <HeadsetIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{__('Support', 'yay-bulk-order')}</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={() =>
                  window.open('https://docs.yaycommerce.com/yay-bulk-order/', '_blank')
                }
              >
                <DocumentIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{__('Documentation', 'yay-bulk-order')}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      <div className="@container/main">
        <Outlet />
      </div>
    </>
  );
}
