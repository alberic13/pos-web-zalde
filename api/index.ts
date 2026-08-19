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

// Vercel Serverless Function Node.js Handler
export default async function handler(req: any, res: any) {
  try {
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
    const fullUrl = `${protocol}://${host}${req.url || '/api'}`;

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          for (const v of value) headers.append(key, v);
        } else {
          headers.set(key, value as string);
        }
      }
    }

    let body: any = undefined;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (req.body !== undefined && req.body !== null) {
        body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      }
    }

    const webRequest = new Request(fullUrl, {
      method: req.method || 'GET',
      headers,
      body,
    });

    const webResponse = await app.handle(webRequest);

    res.statusCode = webResponse.status;
    webResponse.headers.forEach((val, key) => {
      res.setHeader(key, val);
    });

    const arrayBuffer = await webResponse.arrayBuffer();
    res.end(Buffer.from(arrayBuffer));
  } catch (error: any) {
    console.error('Vercel API handler error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: error.message || 'Internal Server Error' }));
  }
}

