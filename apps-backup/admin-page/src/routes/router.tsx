import { createHashRouter, redirect } from 'react-router';

import Layout from './layout/Layout';
import PageDashboard from './PageDashboard';
import PageSettings from './PageSettings';
import PageShortcodes from './PageShortcodes';

export const router = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        loader: () => {
          return redirect('/dashboard');
        },
      },
      {
        path: 'dashboard',
        element: <PageDashboard />,
      },
      {
        path: 'shortcodes',
        element: <PageShortcodes />,
      },
      {
        path: 'shortcodes/new',
        element: <PageShortcodes />,
      },
      {
        path: 'shortcodes/:shortcodeId',
        element: <PageShortcodes />,
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
            element: <PageSettings />,
          },
        ],
      },
    ],
  },
]);
