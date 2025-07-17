import { drizzle } from 'drizzle-orm/node-postgres';

import * as schema from '#server/drizzle/index.ts';
import { appEnvVariables } from '#server/env.ts';

const { DB_NAME, DB_USER, DB_HOST, DB_PORT, DB_PASSWORD } = appEnvVariables;

export const db = drizzle({
  connection: {
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  },
  schema,
});

export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
