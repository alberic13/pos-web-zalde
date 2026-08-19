import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { dashboardRoutes } from '../src/server/routes/dashboard';
import { productRoutes } from '../src/server/routes/products';
import { categoryRoutes } from '../src/server/routes/categories';
import { orderRoutes } from '../src/server/routes/orders';

export const app = new Elysia({ prefix: '/api' })
  .use(cors())
  .get('/health', () => ({ status: 'ok', timestamp: new Date().toISOString() }))
  .use(dashboardRoutes)
  .use(productRoutes)
  .use(categoryRoutes)
  .use(orderRoutes);

const port = Number(process.env.PORT) || 3000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`🚀 Elysia Server listening on http://localhost:${port}`);
  });
}

export default app;
