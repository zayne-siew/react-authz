import { zValidator } from '@hono/zod-validator';
import type { InferSelectModel } from 'drizzle-orm';
import type { Env as _Env, MiddlewareHandler } from 'hono';
import { createMiddleware } from 'hono/factory';
import z from 'zod';

import { todoTable } from '#server/drizzle/todo.ts';
import { db } from '#server/lib/db.ts';
import fgaClient from '#server/lib/openfga.ts';
import { stringifyFgaObject } from '#server/utils/openfga/_helpers.ts';
import type { Env } from './authn.ts';

interface TodoEnv extends Env {
  Variables: Env['Variables'] & { todo: InferSelectModel<typeof todoTable> };
}

/**
 * Validator for the POST request to create a new to-do.
 */
export const postValidator = zValidator(
  'json',
  z.object({
    title: z.string().nonempty('Title is required'),
    description: z.string().optional(),
    ownerId: z.coerce.number({ required_error: 'Owner ID is required' }),
  }),
);

type PostValidatorInput = typeof postValidator extends MiddlewareHandler<
  _Env,
  string,
  infer I
>
  ? I
  : never;

/**
 * Middleware to create a new to-do.
 *
 * The input is expected to be validated using `postValidator`.
 */
export function createTodo() {
  return createMiddleware<TodoEnv, string, PostValidatorInput>(
    async (c, next) => {
      const { title, description, ownerId } = c.req.valid('json');

      try {
        const [todo] = await db
          .insert(todoTable)
          .values({
            title,
            description,
            owner_id: ownerId,
          })
          .onConflictDoNothing()
          .returning();

        if (!todo) throw new Error(`Error inserting to-do ${title}`);
        c.set('todo', todo);
      } catch (error) {
        console.error(error);
        return c.json({ error }, 500);
      }

      await next();
    },
  );
}

/**
 * Middleware to update tuples in OpenFGA authorization model
 * after a to-do is created or updated.
 *
 * TODO: Handle both creation and update in a single middleware.
 */
export function fgaUpdateTodo() {
  return createMiddleware<TodoEnv, string, PostValidatorInput>(async (c) => {
    await fgaClient.write({
      writes: [
        {
          user: stringifyFgaObject(c.var.user),
          relation: 'owner',
          object: `todo:${c.var.todo.title}`,
        },
        ...c.var.organizations.map((org) => ({
          user: stringifyFgaObject(org),
          relation: 'organization',
          object: `todo:${c.var.todo.title}`,
        })),
      ],
    });

    return c.json(c.var.todo, 201);
  });
}
