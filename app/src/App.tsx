import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createHashRouter, redirect, RouterProvider } from 'react-router';

import Layout from '@/components/layout/Layout';
import Settings from '@/components/settings/Settings';
import Customize from '@/components/customize/Customize';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

const router = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <div>This should never be shown</div>,
        loader: () => {
          return redirect('/settings');
        },
      },
      {
        path: 'settings',
        element: <Settings />,
      },
      {
        path: 'customize',
        element: <Customize />,
      },
    ],
  },
]);
