import type { Tables, TablesInsert, TablesUpdate } from '#src/database.gen.ts';
import type { Employee } from './employee.ts';

type BaseTodo = Tables<'todo'>;
export type CreateTodo = TablesInsert<'todo'>;
export type UpdateTodo = TablesUpdate<'todo'>;

export type Todo = BaseTodo & { owner: Employee };
