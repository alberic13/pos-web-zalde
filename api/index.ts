import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import http from 'http';
import { healthRoutes } from './routes/health';
import { authRoutes } from './routes/auth';
import { dashboardRoutes } from './routes/dashboard';
import { categoryRoutes } from './routes/categories';
import { productRoutes } from './routes/products';
import { orderRoutes } from './routes/orders';
import { supplierRoutes } from './routes/suppliers';
import { chatRoutes } from './routes/chat';

export const app = new Elysia()
  .use(
    cors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'X-CSRF-Token',
        'X-Requested-With',
        'Accept',
        'Accept-Version',
        'Content-Length',
        'Content-MD5',
        'Content-Type',
        'Date',
        'X-Api-Version',
      ],
    })
  )
  .use(healthRoutes)
  .use(authRoutes)
  .use(dashboardRoutes)
  .use(categoryRoutes)
  .use(productRoutes)
  .use(orderRoutes)
  .use(supplierRoutes)
  .use(chatRoutes)
  .onError(({ code, error, set }) => {
    const errorMsg =
      error && typeof error === 'object' && 'message' in error
        ? String((error as any).message)
        : String(error);

    if (code === 'NOT_FOUND') {
      set.status = 404;
      return { success: false, error: errorMsg || 'Not Found' };
    }
    set.status = 500;
    return { success: false, error: errorMsg || 'Internal Server Error' };
  });

export default async function handler(req: any, res?: any) {
  // Web Standard / Vercel Edge / Fetch context
  if (req instanceof Request) {
    return app.handle(req);
  }

  // Node.js (req, res) context (Vercel Serverless Node, Local http server, & Bun Test runner)
  try {
    const rawUrl = req.url || '/';
    const parsedUrl = new URL(rawUrl, `http://${req.headers?.host || 'localhost'}`);
    const method = (req.method || 'GET').toUpperCase();

    let body: any = undefined;
    if (method !== 'GET' && method !== 'HEAD') {
      if (typeof req.body === 'string') {
        body = req.body;
      } else if (req.body && typeof req.body === 'object') {
        body = JSON.stringify(req.body);
      } else if (req[Symbol.asyncIterator] || typeof req.on === 'function') {
        const buffers: Uint8Array[] = [];
        for await (const chunk of req) {
          buffers.push(chunk);
        }
        const dataStr = Buffer.concat(buffers).toString();
        if (dataStr) body = dataStr;
      }
    }

    const headers: Record<string, string> = {};
    if (req.headers) {
      for (const [k, v] of Object.entries(req.headers)) {
        if (typeof v === 'string') headers[k] = v;
        else if (Array.isArray(v)) headers[k] = v.join(', ');
      }
    }

    const webReq = new Request(parsedUrl.toString(), {
      method,
      headers,
      body,
    });

    const webRes = await app.handle(webReq);

    res.statusCode = webRes.status;
    webRes.headers.forEach((val, key) => {
      if (typeof res.setHeader === 'function') {
        res.setHeader(key, val);
      }
    });

    const resText = await webRes.text();
    if (typeof res.end === 'function') {
      res.end(resText);
    }
    return webRes;
  } catch (err: any) {
    if (res && typeof res.end === 'function') {
      res.statusCode = 500;
      if (typeof res.setHeader === 'function') {
        res.setHeader('Content-Type', 'application/json');
      }
      res.end(JSON.stringify({ success: false, error: err.message || 'Internal Server Error' }));
    }
  }
}

// Local Development Server Listener
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  const PORT = Number(process.env.PORT) || 3000;
  if (typeof (globalThis as any).Bun !== 'undefined') {
    app.listen(PORT, () => {
      console.log(`🚀 POS Elysia API Server running at http://localhost:${PORT}`);
    });
  } else {
    const server = http.createServer((req, res) => {
      handler(req, res);
    });
    server.listen(PORT, () => {
      console.log(`🚀 POS Elysia API Server (Node.js) running at http://localhost:${PORT}`);
    });
  }
}
