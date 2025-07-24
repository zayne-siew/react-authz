import { sql } from 'drizzle-orm';
import {
  boolean,
  foreignKey,
  integer,
  pgPolicy,
  pgTable,
  text,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm/relations';

import { USER_CONFIG } from '#server/middleware/authn.ts';
import { DEFAULT_COLUMNS } from './_helpers.ts';
import { employeeTable } from './employee.ts';

/**
 * To-dos are used to track tasks or items that need to be completed.
 */
export const todoTable = pgTable(
  'todo',
  {
    ...DEFAULT_COLUMNS,
    title: text('title').unique().notNull(),
    description: text('description'),
    completed: boolean('completed').notNull().default(false),
    owner_id: integer('owner_id').notNull(),
  },
  (table) => [
    foreignKey({
      name: 'employee_id_fkey',
      columns: [table.owner_id],
      foreignColumns: [employeeTable.id],
    })
      .onUpdate('cascade')
      .onDelete('restrict'),

    // RLS policies for the todo table
    pgPolicy('employee_select_policy', {
      as: 'permissive',
      for: 'select',
      using: sql`allow(current_setting(${USER_CONFIG}, true), 'can_view', 'todo:' || title)`,
    }),
    pgPolicy('employee_insert_policy', {
      as: 'permissive',
      for: 'insert',
      using: sql`allow(current_setting(${USER_CONFIG}, true), 'can_create', 'todo:' || title)`,
    }),
    pgPolicy('employee_update_policy', {
      as: 'permissive',
      for: 'update',
      using: sql`allow(current_setting(${USER_CONFIG}, true), 'can_update', 'todo:' || title)`,
    }),
    pgPolicy('employee_delete_policy', {
      as: 'permissive',
      for: 'delete',
      using: sql`allow(current_setting(${USER_CONFIG}, true), 'can_delete', 'todo:' || title)`,
    }),
  ],
);

export const todoRelations = relations(todoTable, ({ one }) => ({
  owner: one(employeeTable, {
    fields: [todoTable.owner_id],
    references: [employeeTable.id],
  }),
}));
