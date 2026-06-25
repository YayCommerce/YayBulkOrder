import './main.css';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { domAnimation, LazyMotion } from 'motion/react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';

import { getAppAdminRouter } from '@/router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

createRoot(document.getElementById('yay-bulk-order-app-admin') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <LazyMotion features={domAnimation}>
        <RouterProvider router={getAppAdminRouter()} />
      </LazyMotion>
    </QueryClientProvider>
  </React.StrictMode>,
);
