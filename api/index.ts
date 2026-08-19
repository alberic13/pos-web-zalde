import { app } from '../src/server/index';

// Vercel Serverless Adapter for Elysia.js
export default async function handler(req: any, res: any) {
  try {
    const protocol = req.headers?.['x-forwarded-proto'] || 'http';
    const host = req.headers?.host || 'localhost:3000';
    const rawUrl = req.url || '/api/health';
    const url = rawUrl.startsWith('http') ? rawUrl : `${protocol}://${host}${rawUrl}`;

    let bodyString: string | undefined = undefined;
    if (req.method && req.method !== 'GET' && req.method !== 'HEAD') {
      if (req.body !== undefined && req.body !== null) {
        bodyString = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      } else if (typeof req.on === 'function') {
        bodyString = await new Promise<string>((resolve, reject) => {
          let data = '';
          req.on('data', (chunk: any) => (data += chunk));
          req.on('end', () => resolve(data));
          req.on('error', (err: any) => reject(err));
        });
      }
    }

    const headers = new Headers();
    if (req.headers) {
      for (const [key, value] of Object.entries(req.headers)) {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((v) => headers.append(key, v));
          } else {
            headers.set(key, value as string);
          }
        }
      }
    }

    if (bodyString && !headers.has('content-type')) {
      headers.set('content-type', 'application/json');
    }

    const webRequest = new Request(url, {
      method: req.method || 'GET',
      headers,
      body: bodyString,
    });

    const response = await app.handle(webRequest);

    if (res && typeof res.setHeader === 'function') {
      res.statusCode = response.status;
      response.headers.forEach((value: string, key: string) => {
        res.setHeader(key, value);
      });
      const responseText = await response.text();
      res.end(responseText);
    } else {
      return response;
    }
  } catch (error: any) {
    console.error('Vercel Elysia Adapter Error:', error);
    if (res && typeof res.statusCode !== 'undefined') {
      res.statusCode = 500;
      res.end(JSON.stringify({ success: false, error: error.message || 'Internal Server Error' }));
    }
  }
}
