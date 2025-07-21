import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { logger } from 'hono/logger';
import { trimTrailingSlash } from 'hono/trailing-slash';

import employeeRoute from './routes/employee.ts';
import todoRoute from './routes/todo.ts';

const app = new Hono();
app.use(logger());
app.use(trimTrailingSlash());
app.notFound((c) => c.json({ message: 'Not Found' }, 404));

app.get('/', (c) => {
  return c.json({ message: 'Ok', time: new Date().toISOString() });
});

app.get('/healthz', (c) => {
  return c.json({ message: 'Ok', time: new Date().toISOString() });
});

export const apiRoutes = app
  .basePath('api')
  .route('/employee', employeeRoute)
  .route('/todo', todoRoute);

export type ApiRoutes = typeof apiRoutes;

app
  .get('/*', serveStatic({ root: `${import.meta.dir}/static` }))
  .get('/*', serveStatic({ path: `${import.meta.dir}/static/index.html` }));

if (Bun.isMainThread) {
  Bun.serve({
    port: 30000,
    fetch: app.fetch,
  });
} else {
  Bun.serve({
    unix: `${import.meta.dir}/server.sock`,
    fetch: app.fetch,
  });
}
