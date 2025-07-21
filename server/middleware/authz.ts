// Adapted from: https://github.com/honojs/middleware/blob/main/packages/clerk-auth/src/index.ts

import type { FgaObject } from '@openfga/sdk';
import { createMiddleware } from 'hono/factory';

import fgaClient, {
  parseFgaObject,
  stringifyFgaObject,
} from '#server/lib/openfga.ts';
import type { AppEnvVariables } from '#server/zod/env.ts';

declare module 'hono' {
  interface ContextVariableMap {
    /**
     * The current OpenFGA user.
     */
    user: FgaObject;
    /**
     * The organizations the user belongs to.
     */
    organizations: FgaObject[];
  }
}

/**
 * This middleware provides authorization information about the logged-in user.
 * It parses authentication information from the request and sets the `user` and `organizations` context variables.
 */
export function authz() {
  return createMiddleware<{ Variables: AppEnvVariables }>(async (c, next) => {
    // Insert authentication logic here
    // TODO: For now, we will just mock the user
    const user: FgaObject = {
      type: 'user',
      id: 'bob',
    };
    c.set('user', user);

    // Retrieve organizations from OpenFGA
    console.log('Fetching organizations for user:', stringifyFgaObject(user));
    const response = await fgaClient.listObjects({
      user: stringifyFgaObject(user),
      relation: 'member',
      type: 'organization',
    });

    if (response.$response.status !== 200) {
      console.error('Failed to fetch organizations:', response.$response);
      c.set('organizations', []);
    } else {
      console.log('Organizations:', response.objects);
      c.set('organizations', response.objects.map(parseFgaObject));
    }

    await next();
  });
}
