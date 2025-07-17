import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dbCredentials: {
    database: process.env.DB_NAME || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    // TODO: configure as secrets in production
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    ssl: false,
  },
  dialect: 'postgresql',
  schema: 'server/drizzle/*.ts',
  out: './migrations',
  breakpoints: true,
});
