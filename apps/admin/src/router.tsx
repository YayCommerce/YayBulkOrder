import { createHashRouter, redirect } from 'react-router';

import Layout from './routes/Layout';
import PageBulkOrderTables from './routes/PageBulkOrderTables';
import PageCustomize from './routes/PageCustomize';

export const router = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <div>This should never be shown</div>,
        loader: () => {
          return redirect('/bulk-order-tables');
        },
      },
      {
        path: 'bulk-order-tables',
        element: <PageBulkOrderTables />,
      },
      {
        path: 'bulk-order-tables/new',
        element: <PageBulkOrderTables />,
      },
      {
        path: 'bulk-order-tables/:tableId',
        element: <PageBulkOrderTables />,
      },
      {
        path: 'customize',
        element: <PageCustomize />,
      },
    ],
  },
]);
