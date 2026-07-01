import { createHashRouter, redirect } from 'react-router';

import { AppLayout } from '@/components/layout/AppLayout';
import { NotFoundPage } from '@/pages/404';
import { ErrorPage } from '@/pages/500';
import { HomePage } from '@/pages/home/HomePage';
import { ProductTablesPage } from '@/pages/product-tables/ProductTablesPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';

export function getAppAdminRouter() {
  return createHashRouter([
    {
      path: '/',
      element: <AppLayout />,
      errorElement: <ErrorPage />,
      children: [
        {
          index: true,
          loader: () => redirect('/home'),
        },
        {
          path: 'home',
          element: <HomePage />,
        },
        {
          path: 'product-tables',
          element: <ProductTablesPage />,
        },
        {
          path: 'settings',
          children: [
            {
              index: true,
              loader: () => redirect('/settings/general'),
            },
            {
              path: ':subMenu',
              loader: ({ params }) => {
                if (!params.subMenu || !settingSubMenus.includes(params.subMenu)) {
                  return redirect('/settings/general');
                }
              },
              element: <SettingsPage />,
            },
          ],
        },
        {
          path: '*',
          element: <NotFoundPage />,
        },
      ],
    },
  ]);
}

const settingSubMenus = ['general', 'styles'];
