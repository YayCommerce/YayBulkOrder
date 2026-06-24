import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import './main.css';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';

import { router } from './routes/router';

const queryClient = new QueryClient();

createRoot(document.getElementById('yay-bulk-order-admin-page') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
);
