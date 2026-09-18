import { describe, test, expect, beforeAll } from 'bun:test';
import { app } from '../api/index';
import { prisma } from '../api/db';
import bcrypt from 'bcryptjs';

async function testFetch(path: string, options: { method?: string; body?: any; token?: string } = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  const req = new Request(`http://localhost${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const res = await app.handle(req);
  const text = await res.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  return { status: res.status, json };
}

describe('Security & RBAC Enforcement Tests', () => {
  let adminToken = '';
  let kasirToken = '';

  beforeAll(async () => {
    try {
      const passwordHash = await bcrypt.hash('admin123', 10);
      await prisma.user.upsert({
        where: { username: 'admin' },
        update: { passwordHash, role: 'ADMIN', name: 'Admin Zalde' },
        create: {
          username: 'admin',
          passwordHash,
          role: 'ADMIN',
          name: 'Admin Zalde',
        },
      });
    } catch (_err) {
      // Graceful fallback if database connection issue
    }
  });

  test('Reject login with invalid credentials', async () => {
    const res = await testFetch('/api/auth/login', {
      method: 'POST',
      body: { username: 'admin', password: 'wrongpassword' },
    });
    expect(res.status).toBe(401);
    expect(res.json.success).toBe(false);
  });

  test('Allow login with valid credentials and return signed JWT', async () => {
    const res = await testFetch('/api/auth/login', {
      method: 'POST',
      body: { username: 'admin', password: 'admin123' },
    });
    expect(res.status).toBe(200);
    expect(res.json.success).toBe(true);
    expect(typeof res.json.data.token).toBe('string');
    expect(res.json.data.user.role).toBe('ADMIN');
    adminToken = res.json.data.token;
  });

  test('Support 1-click demo login and return role-specific JWT', async () => {
    const res = await testFetch('/api/auth/login', {
      method: 'POST',
      body: { role: 'KASIR' },
    });
    expect(res.status).toBe(200);
    expect(res.json.success).toBe(true);
    expect(res.json.data.user.role).toBe('KASIR');
    kasirToken = res.json.data.token;
  });

  test('Reject product creation when no token is provided', async () => {
    const res = await testFetch('/api/products', {
      method: 'POST',
      body: { name: 'Unauthorized Item', price: 10000, stock: 10, categoryId: 'cat-1' },
    });
    expect(res.status).toBe(401);
    expect(res.json.success).toBe(false);
  });

  test('Reject product creation for KASIR role (403 Forbidden)', async () => {
    const res = await testFetch('/api/products', {
      method: 'POST',
      body: { name: 'Kasir Item', price: 10000, stock: 10, categoryId: 'cat-1' },
      token: kasirToken,
    });
    expect(res.status).toBe(403);
    expect(res.json.success).toBe(false);
  });

  test('Allow checkout order for KASIR role', async () => {
    const res = await testFetch('/api/orders', {
      method: 'POST',
      body: {
        items: [{ productId: 'dummy-id', quantity: 1, price: 10000 }],
        paymentAmount: 10000,
      },
      token: kasirToken,
    });
    // Should NOT be 401 or 403 (passed auth guard, might fail on dummy product id in DB tx, but auth guard passed)
    expect([200, 201, 400, 500]).toContain(res.status);
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });

  test('Allow token validation via /api/auth/me', async () => {
    const res = await testFetch('/api/auth/me', {
      method: 'GET',
      token: adminToken,
    });
    expect(res.status).toBe(200);
    expect(res.json.success).toBe(true);
    expect(res.json.data.user.username).toBe('admin');
  });
});
