import { createHashRouter, redirect } from 'react-router';

import { NotFoundPage } from '@/pages/404';
import { ErrorPage } from '@/pages/500';
import { HomePage } from '@/pages/home/HomePage';
import { ProductTablesPage } from '@/pages/product-tables/ProductTablesPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';
import { AppLayout } from './AppLayout';

export function getAppAdminRouter() {
  return createHashRouter([
    {
      path: '/',
      element: <AppLayout />,
      errorElement: <ErrorPage />,
      children: [
        {
          index: true,
          loader: () => redirect('/honme'),
        },
        {
          path: 'honme',
          element: <HomePage />,
        },
        {
          path: 'product-tables',
          element: <ProductTablesPage />,
        },
        {
          path: 'settings',
          element: <SettingsPage />,
        },
        {
          path: '*',
          element: <NotFoundPage />,
        },
      ],
    },
  ]);
}
