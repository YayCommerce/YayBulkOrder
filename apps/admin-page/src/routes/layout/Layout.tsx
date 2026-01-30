import { Outlet } from 'react-router';

import { Toaster } from '@/components/ui/sonner';
import HeaderLogo from './HeaderLogo';
import HeaderMenu from './HeaderMenu';

export default function Layout() {
  return (
    <>
      <div className="relative flex h-[54px] items-center justify-between gap-4 bg-background py-0 pr-3 sm:gap-5 lg:pr-6">
        <HeaderLogo />
        <HeaderMenu />
      </div>
      <div className="@container/main">
        <Outlet />
      </div>
      <Toaster />
    </>
  );
}
