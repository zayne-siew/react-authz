import { AppShell } from '@mantine/core';
import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { useMemo, useState } from 'react';

import { EmployeeContext } from '#hooks/employee.ts';
import TanstackQueryLayout from '#integrations/tanstack-query/layout.tsx';
import type { Employee } from '#src/types/employee';

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => {
    const [currentEmployee] = useState<Employee | null>(null);

    const nodeEnv = import.meta.env.VITE_NODE_ENV ?? 'production';

    // region App outlet
    const applet = useMemo(
      () => (
        <AppShell padding="xl">
          <AppShell.Main>
            <Outlet />
          </AppShell.Main>
        </AppShell>
      ),
      [],
    );
    // endregion

    return (
      <EmployeeContext.Provider value={currentEmployee}>
        {applet}
        {nodeEnv === 'development' && <TanStackRouterDevtools />}
        {nodeEnv === 'development' && <TanstackQueryLayout />}
      </EmployeeContext.Provider>
    );
  },
});
