import type { Context } from 'hono';
import { createMiddleware } from 'hono/factory';

import fgaClient from '#server/lib/openfga.ts';
import { stringifyFgaObject } from '#server/utils/openfga/_helpers.ts';
import type { Env } from './authn.ts';

/**
 * Actions that can be performed on a given resource.
 * These actions are used to check permissions in the middleware.
 */
enum Action {
  VIEW = 'view',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

/**
 * Map of actions to their corresponding FGA relations.
 * This is used to check permissions for the given action.
 */
const TODO_RELATIONS: Record<Action, string> = {
  [Action.VIEW]: 'can_view_todos',
  [Action.CREATE]: 'can_create_todos',
  [Action.UPDATE]: 'can_update_todos',
  [Action.DELETE]: 'can_delete_todos',
};

/**
 * Handles RBAC for performing a given action on todos.
 */
async function permissionHandler(
  c: Context<Env>,
  action: Action,
): Promise<boolean> {
  const response = await fgaClient.batchCheck(
    {
      checks: c.var.organizations.map((organization) => ({
        user: stringifyFgaObject(c.var.user),
        relation: TODO_RELATIONS[action],
        object: stringifyFgaObject(organization),
      })),
    },
    {
      authorizationModelId: c.env.FGA_AUTHORIZATION_MODEL_ID,
    },
  );

  if (response.result.every((check) => !check.allowed)) {
    console.warn(`User is not authorized to ${action} todos`);
    return false;
  }
  return true;
}

/**
 * Middleware to handle RBAC for viewing todos.
 *
 * It denies the request altogether if the user is not authenticated
 * or does not belong to any organizations.
 */
export function canViewTodos() {
  return createMiddleware<Env>(async (c, next) => {
    const allowed = await permissionHandler(c, Action.VIEW);
    if (!allowed) return c.json({ error: 'Unauthorized' }, 401);
    await next();
  });
}

/**
 * Middleware to handle RBAC for creating todos.
 *
 * It denies the request if the user is not authenticated
 * or does not belong to any organizations.
 */
export function canCreateTodos() {
  return createMiddleware<Env>(async (c, next) => {
    const allowed = await permissionHandler(c, Action.CREATE);
    if (!allowed) return c.json({ error: 'Unauthorized' }, 401);
    await next();
  });
}

/**
 * Middleware to handle RBAC for updating todos.
 *
 * It denies the request if the user is not authenticated
 * or does not belong to any organizations.
 */
export function canUpdateTodos() {
  return createMiddleware<Env>(async (c, next) => {
    const allowed = await permissionHandler(c, Action.UPDATE);
    if (!allowed) return c.json({ error: 'Unauthorized' }, 401);
    await next();
  });
}

/**
 * Middleware to handle RBAC for deleting todos.
 *
 * It denies the request if the user is not authenticated
 * or does not belong to any organizations.
 */
export function canDeleteTodos() {
  return createMiddleware<Env>(async (c, next) => {
    const allowed = await permissionHandler(c, Action.DELETE);
    if (!allowed) return c.json({ error: 'Unauthorized' }, 401);
    await next();
  });
}
