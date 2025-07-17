import {
  boolean,
  foreignKey,
  integer,
  pgTable,
  text,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm/relations';

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
  ],
);

export const todoRelations = relations(todoTable, ({ one }) => ({
  owner: one(employeeTable, {
    fields: [todoTable.owner_id],
    references: [employeeTable.id],
  }),
}));
