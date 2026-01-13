import { createHashRouter, redirect } from 'react-router';

import Layout from './Layout';
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
        element: <div>This should never be shown</div>,
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
        path: 'shortcodes/:formId',
        element: <PageShortcodes />,
      },
      {
        path: 'settings',
        element: <PageSettings />,
      },
    ],
  },
]);
