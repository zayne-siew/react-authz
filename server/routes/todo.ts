import { zValidator } from '@hono/zod-validator';
import { count, eq } from 'drizzle-orm';
import { z } from 'zod';

import { employeeTable, todoTable } from '#server/drizzle/index.ts';
import { factory } from '#server/factory.ts';
import { db } from '#server/lib/db.ts';
import { authn } from '#server/middleware/authn.ts';
import {
  canCreateTodos,
  canDeleteTodos,
  canUpdateTodos,
  canViewTodos,
} from '#server/middleware/authz';
import {
  createTodo,
  fgaUpdateTodo,
  postValidator,
} from '#server/middleware/todo.ts';
import {
  getOffset,
  LIMIT_PARAM,
  PAGE_PARAM,
} from '#server/utils/pagination.ts';

/**
 * Limit to number of to-dos to query.
 */
export const TODO_QUERY_LIMIT = 100;

const route = factory
  .createApp()
  .use(authn())

  .get(
    '/',
    canViewTodos(),
    zValidator(
      'query',
      z.object({
        page: PAGE_PARAM,
        limit: LIMIT_PARAM,
      }),
    ),
    async (c) => {
      const { page, limit = TODO_QUERY_LIMIT } = c.req.valid('query');

      const result = await db
        .select()
        .from(todoTable)
        .leftJoin(employeeTable, eq(todoTable.owner_id, employeeTable.id))
        .limit(limit)
        .offset(getOffset(page, limit));

      const todos = result.map(({ employees, todo }) => ({
        ...todo,
        owner: employees,
      }));
      return c.json(todos, 200);
    },
  )

  .get('/count', canViewTodos(), async (c) => {
    const [result] = await db.select({ value: count() }).from(todoTable);
    return !result ? c.notFound() : c.json({ value: result.value }, 200);
  })

  .get('/:id', canViewTodos(), async (c) => {
    const id = Number(c.req.param('id'));

    const [result] = await db
      .select()
      .from(todoTable)
      .leftJoin(employeeTable, eq(todoTable.owner_id, employeeTable.id))
      .where(eq(todoTable.id, id));

    if (!result) return c.notFound();
    const { employees, todo } = result;
    return c.json({ ...todo, owner: employees }, 200);
  })

  .post('/', canCreateTodos(), postValidator, createTodo(), fgaUpdateTodo())

  .put(
    '/:id',
    canUpdateTodos(),
    zValidator(
      'json',
      z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        ownerId: z.coerce.number().optional(),
      }),
    ),
    async (c) => {
      const id = Number(c.req.param('id'));
      const { title, description, ownerId } = c.req.valid('json');

      try {
        const [todo] = await db
          .update(todoTable)
          .set({ title, description, owner_id: ownerId })
          .where(eq(todoTable.id, id))
          .returning();

        return !todo ? c.notFound() : c.json(todo, 200);
      } catch (error) {
        console.error(error);
        return c.json({ error }, 500);
      }
    },
  )

  .delete('/:id', canDeleteTodos(), async (c) => {
    const id = Number(c.req.param('id'));
    const [todo] = await db
      .delete(todoTable)
      .where(eq(todoTable.id, id))
      .returning();
    return !todo ? c.notFound() : c.json(todo, 200);
  });

export default route;
