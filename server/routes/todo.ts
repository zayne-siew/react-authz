import { zValidator } from '@hono/zod-validator';
import { count, eq } from 'drizzle-orm';
import { z } from 'zod';

import { todoTable } from '#server/drizzle/index.ts';
import { factory } from '#server/factory.ts';
import { db } from '#server/lib/db.ts';
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

  .get(
    '/',
    zValidator(
      'query',
      z.object({
        page: PAGE_PARAM,
        limit: LIMIT_PARAM,
      }),
    ),
    async (c) => {
      const { page, limit = TODO_QUERY_LIMIT } = c.req.valid('query');
      const todos = await db.query.todoTable.findMany({
        with: { owner: true },
        limit,
        offset: getOffset(page, limit),
      });
      return c.json(todos, 200);
    },
  )

  .get('/count', async (c) => {
    const todoCount = await db.select({ value: count() }).from(todoTable);
    return todoCount.length === 0
      ? c.notFound()
      : c.json({ value: todoCount[0].value }, 200);
  })

  .get('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    const todo = await db.query.todoTable.findFirst({
      with: { owner: true },
      where: (todoTable, { eq }) => eq(todoTable.id, id),
    });
    return !todo ? c.notFound() : c.json(todo, 200);
  })

  .post(
    '/',
    zValidator(
      'json',
      z.object({
        title: z.string().nonempty('Title is required'),
        description: z.string().optional(),
        ownerId: z.coerce.number({ required_error: 'Owner ID is required' }),
      }),
    ),
    async (c) => {
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
        return c.json(todo, 201);
      } catch (error) {
        console.error(error);
        return c.json({ error }, 500);
      }
    },
  )

  .put(
    '/:id',
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

  .delete('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    const [todo] = await db
      .delete(todoTable)
      .where(eq(todoTable.id, id))
      .returning();
    return !todo ? c.notFound() : c.json(todo, 200);
  });

export default route;
