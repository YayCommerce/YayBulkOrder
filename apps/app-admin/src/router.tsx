import { createHashRouter, redirect } from 'react-router';

import DashboardPage from '@/pages/dashboard/DashboardPage';
import AppLayout from './AppLayout';
import NotFoundPage from './pages/404';
import ErrorPage from './pages/500';

export function getAppAdminRouter() {
  return createHashRouter([
    {
      path: '/',
      element: <AppLayout />,
      errorElement: <ErrorPage />,
      children: [
        {
          index: true,
          loader: () => redirect('/dashboard'),
        },
        {
          path: 'dashboard',
          element: <DashboardPage />,
        },
        {
          path: '*',
          element: <NotFoundPage />,
        },
      ],
    },
  ]);
}
