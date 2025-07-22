import '@mantine/core/styles.css';
import '@mantine/core/styles.layer.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import './main.css';

import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import theme from '#src/theme.ts';
import * as TanstackQuery from './integrations/tanstack-query/root-provider.tsx';
import reportWebVitals from './reportWebVitals.ts';
// Import the generated route tree
import { routeTree } from './routeTree.gen.ts';

const router = createRouter({
  routeTree,
  context: {
    ...TanstackQuery.getContext(),
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// biome-ignore lint/style/noNonNullAssertion: root element is there
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={theme}>
      <TanstackQuery.Provider>
        <RouterProvider router={router} />
        <Notifications position="top-right" limit={5} />
      </TanstackQuery.Provider>
    </MantineProvider>
  </StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
