// Adapted from: https://github.com/honojs/middleware/blob/main/packages/clerk-auth/src/index.ts

import type { FgaObject } from '@openfga/sdk';
import { sql } from 'drizzle-orm';
import { createMiddleware } from 'hono/factory';

import type { RouteBindings } from '#server/factory.ts';
import { db } from '#server/lib/db.ts';
import { stringifyFgaObject } from '#server/utils/openfga/_helpers.ts';
import { getUserOrganizations } from '#server/utils/openfga/core.ts';

/**
 * PostgreSQL user config key; for interacting with database policies.
 */
export const USER_CONFIG = 'current_user';

/**
 * Interface for the authentication variables.
 * This is used to define the context variable for the user.
 */
interface AuthnVariables {
  /**
   * The current OpenFGA user.
   */
  user: FgaObject;
  /**
   * The organization(s) the user belongs to.
   */
  organizations: FgaObject[];
}

/**
 * Environment interface for all Hono middleware.
 */
export interface Env extends RouteBindings {
  Variables: AuthnVariables;
}

/**
 * This middleware provides authorization information about the logged-in user.
 * It parses authentication information from the request and sets the `user` context variable.
 */
export function authn() {
  return createMiddleware<Env>(async (c, next) => {
    // Insert authentication logic here
    // TODO: For now, we will just mock the user
    const user: FgaObject = {
      type: 'user',
      id: 'bob',
    };
    const organizations = await getUserOrganizations(user);

    c.set('user', user);
    c.set('organizations', organizations);

    await db.execute(
      sql`select set_config(${USER_CONFIG}, ${stringifyFgaObject(user)}, true)`,
    );
    await next();
  });
}
