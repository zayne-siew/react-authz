import { zValidator } from '@hono/zod-validator';
import { count, eq } from 'drizzle-orm';
import { z } from 'zod';

import { employeeTable } from '#server/drizzle/employee.ts';
import { factory } from '#server/factory.ts';
import { db } from '#server/lib/db.ts';
import {
  getOffset,
  LIMIT_PARAM,
  PAGE_PARAM,
} from '#server/utils/pagination.ts';

/**
 * Limit to number of employees to query.
 */
export const EMPLOYEE_QUERY_LIMIT = 50;

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
      const { page, limit = EMPLOYEE_QUERY_LIMIT } = c.req.valid('query');
      const employees = await db.query.employeeTable.findMany({
        with: { role: true },
        limit,
        offset: getOffset(page, limit),
      });
      return c.json(employees, 200);
    },
  )

  .get('/count', async (c) => {
    const employeeCount = await db
      .select({ value: count() })
      .from(employeeTable);
    return employeeCount.length === 0
      ? c.notFound()
      : c.json({ value: employeeCount[0].value }, 200);
  })

  .get('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    const employee = await db.query.employeeTable.findFirst({
      with: { role: true },
      where: (employeeTable, { eq }) => eq(employeeTable.id, id),
    });
    return !employee ? c.notFound() : c.json(employee, 200);
  })

  .post(
    '/',
    zValidator(
      'json',
      z.object({
        name: z.string().nonempty('Name is required'),
        roleId: z.number().optional(),
      }),
    ),
    async (c) => {
      const { name, roleId } = c.req.valid('json');

      try {
        const [employee] = await db
          .insert(employeeTable)
          .values({
            name,
            role_id: roleId,
          })
          .onConflictDoNothing()
          .returning();

        if (!employee) throw new Error(`Error inserting employee ${name}`);
        return c.json(employee, 201);
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
        name: z.string().optional(),
        roleId: z.number().optional(),
      }),
    ),
    async (c) => {
      const id = Number(c.req.param('id'));
      const { name, roleId } = c.req.valid('json');

      try {
        const [employee] = await db
          .update(employeeTable)
          .set({ name, role_id: roleId })
          .where(eq(employeeTable.id, id))
          .returning();
        return !employee ? c.notFound() : c.json(employee, 200);
      } catch (error) {
        console.error(error);
        return c.json({ error }, 500);
      }
    },
  )

  .delete('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    const [employee] = await db
      .delete(employeeTable)
      .where(eq(employeeTable.id, id))
      .returning();
    return !employee ? c.notFound() : c.json(employee, 200);
  });

export default route;
