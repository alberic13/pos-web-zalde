import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { categoryRoutes } from './routes/categories';
import { productRoutes } from './routes/products';
import { orderRoutes } from './routes/orders';
import { dashboardRoutes } from './routes/dashboard';

export const app = new Elysia({ prefix: '/api' })
  .use(cors())
  .get('/health', () => ({
    status: 'ok',
    message: 'POS Zalde Elysia.js API Server Running',
    timestamp: new Date().toISOString(),
  }))
  .use(categoryRoutes)
  .use(productRoutes)
  .use(orderRoutes)
  .use(dashboardRoutes);

// If executed directly with Bun or tsx in local development, start listening on PORT 3000
if (typeof process !== 'undefined' && !process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 POS Zalde Elysia.js Server listening on http://localhost:${PORT}`);
  });
}
