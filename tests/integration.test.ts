import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import handler from '../api/index';
import { prisma } from '../src/lib/db';

const TEST_TIMEOUT = 15000; // 15 seconds for database network roundtrips

// Helper function to send HTTP requests to our API handler
async function request(path: string, options: { method?: string; body?: any } = {}) {
  const method = options.method || 'GET';
  const req = {
    url: `http://localhost${path}`,
    method,
    headers: {
      host: 'localhost',
      'content-type': 'application/json',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  };

  let statusCode = 200;
  let headers: Record<string, string> = {};
  let bodyText = '';

  const res = {
    statusCode: 200,
    setHeader(k: string, v: string) {
      headers[k.toLowerCase()] = v;
    },
    end(data?: string) {
      bodyText = data || '';
    },
    get statusCodeVal() {
      return statusCode;
    },
    set statusCodeVal(val: number) {
      statusCode = val;
    },
  };

  Object.defineProperty(res, 'statusCode', {
    get() {
      return statusCode;
    },
    set(val: number) {
      statusCode = val;
    },
  });

  await handler(req, res);

  let json: any = null;
  try {
    json = JSON.parse(bodyText);
  } catch {
    json = bodyText;
  }

  return { status: statusCode, headers, json, text: bodyText };
}

describe('Integration Tests: API / Serverless ↔ Prisma ORM ↔ Database', () => {
  let createdCategoryId: string = '';
  let createdProductId: string = '';
  let createdOrderId: string = '';
  const testSku = `TEST-SKU-${Date.now()}`;

  beforeAll(async () => {
    // Ensure database connection is active
    const catCount = await prisma.category.count();
    expect(catCount).toBeGreaterThanOrEqual(0);
  });

  afterAll(async () => {
    // Cleanup test data from database
    try {
      if (createdOrderId) {
        await prisma.order.delete({ where: { id: createdOrderId } }).catch(() => {});
      }
      if (createdProductId) {
        await prisma.product.delete({ where: { id: createdProductId } }).catch(() => {});
      }
      if (createdCategoryId) {
        await prisma.category.delete({ where: { id: createdCategoryId } }).catch(() => {});
      }
    } catch (e) {
      console.error('Test cleanup error:', e);
    }
  });

  test('1. Health Check Endpoint (/api/health)', async () => {
    const res = await request('/api/health');
    expect(res.status).toBe(200);
    expect(res.json.status).toBe('ok');
    expect(res.json.timestamp).toBeDefined();
  }, TEST_TIMEOUT);

  test('2. Category API & Database Integration', async () => {
    // 2a. Create Category via API
    const categoryName = `Test Category ${Date.now()}`;
    const createRes = await request('/api/categories', {
      method: 'POST',
      body: { name: categoryName },
    });

    expect(createRes.status).toBe(200);
    expect(createRes.json.success).toBe(true);
    expect(createRes.json.data.id).toBeDefined();

    createdCategoryId = createRes.json.data.id;

    // 2b. Direct Database Verification via Prisma
    const dbCategory = await prisma.category.findUnique({
      where: { id: createdCategoryId },
    });
    expect(dbCategory).not.toBeNull();
    expect(dbCategory?.name).toBe(categoryName);

    // 2c. Fetch Categories List via API
    const listRes = await request('/api/categories');
    expect(listRes.status).toBe(200);
    expect(listRes.json.success).toBe(true);
    const found = listRes.json.data.find((c: any) => c.id === createdCategoryId);
    expect(found).toBeDefined();

    // 2d. Update Category via API
    const updatedName = `Updated Category ${Date.now()}`;
    const updateRes = await request(`/api/categories/${createdCategoryId}`, {
      method: 'PUT',
      body: { name: updatedName },
    });
    expect(updateRes.status).toBe(200);
    expect(updateRes.json.data.name).toBe(updatedName);
  }, TEST_TIMEOUT);

  test('3. Product API & Database Integration', async () => {
    expect(createdCategoryId).not.toBe('');

    // 3a. Create Product via API
    const productData = {
      sku: testSku,
      name: 'Integration Test Wireless Mouse',
      price: 150000,
      costPrice: 80000,
      stock: 25,
      categoryId: createdCategoryId,
      imageUrl: 'https://example.com/mouse.jpg',
    };

    const createRes = await request('/api/products', {
      method: 'POST',
      body: productData,
    });

    expect(createRes.status).toBe(200);
    expect(createRes.json.success).toBe(true);
    expect(createRes.json.data.sku).toBe(testSku);

    createdProductId = createRes.json.data.id;

    // 3b. Direct Database Verification via Prisma
    const dbProduct = await prisma.product.findUnique({
      where: { id: createdProductId },
      include: { category: true },
    });

    expect(dbProduct).not.toBeNull();
    expect(dbProduct?.price).toBe(150000);
    expect(dbProduct?.stock).toBe(25);
    expect(dbProduct?.category.id).toBe(createdCategoryId);

    // 3c. Get Single Product Details via API
    const getRes = await request(`/api/products/${createdProductId}`);
    expect(getRes.status).toBe(200);
    expect(getRes.json.data.name).toBe('Integration Test Wireless Mouse');

    // 3d. Transfer Stock from Warehouse to Display via API
    const transferRes = await request(`/api/products/${createdProductId}/transfer-to-display`, {
      method: 'POST',
      body: { amount: 5 },
    });
    expect(transferRes.status).toBe(200);
    expect(transferRes.json.success).toBe(true);
    expect(transferRes.json.data.stock).toBe(30); // 25 + 5 = 30
    expect(transferRes.json.data.warehouseStock).toBe(15); // 20 - 5 = 15
  }, TEST_TIMEOUT);

  test('4. POS Checkout Transaction & Automatic Stock Deduction', async () => {
    expect(createdProductId).not.toBe('');

    // Read initial stock from database
    const initialProduct = await prisma.product.findUnique({ where: { id: createdProductId } });
    const initialStock = initialProduct!.stock; // 25
    const purchaseQty = 3;

    // 4a. Execute Order Checkout via API
    const orderData = {
      items: [{ productId: createdProductId, quantity: purchaseQty, price: 150000 }],
      paymentAmount: 500000,
      paymentMethod: 'QRIS',
    };

    const checkoutRes = await request('/api/orders', {
      method: 'POST',
      body: orderData,
    });

    expect(checkoutRes.status).toBe(200);
    expect(checkoutRes.json.success).toBe(true);
    expect(checkoutRes.json.data.id).toBeDefined();

    createdOrderId = checkoutRes.json.data.id;
    const expectedTotal = 150000 * purchaseQty; // 450000
    const expectedChange = 500000 - expectedTotal; // 50000

    expect(checkoutRes.json.data.totalAmount).toBe(expectedTotal);
    expect(checkoutRes.json.data.changeAmount).toBe(expectedChange);

    // 4b. VERIFY ATOMIC TRANSACTION IN DATABASE: Stock must be decremented by purchaseQty
    const updatedProduct = await prisma.product.findUnique({ where: { id: createdProductId } });
    expect(updatedProduct?.stock).toBe(initialStock - purchaseQty); // 25 - 3 = 22

    // 4c. Verify Order Record in Database
    const dbOrder = await prisma.order.findUnique({
      where: { id: createdOrderId },
      include: { items: true },
    });
    expect(dbOrder).not.toBeNull();
    expect(dbOrder?.paymentMethod).toBe('QRIS');
    expect(dbOrder?.items.length).toBe(1);
    expect(dbOrder?.items[0].quantity).toBe(purchaseQty);
  }, TEST_TIMEOUT);

  test('5. Dashboard Analytics Endpoint (/api/dashboard/stats)', async () => {
    const statsRes = await request('/api/dashboard/stats');
    expect(statsRes.status).toBe(200);
    expect(statsRes.json.success).toBe(true);

    const data = statsRes.json.data;
    expect(data.todayRevenue).toBeGreaterThanOrEqual(0);
    expect(data.todayOrdersCount).toBeGreaterThanOrEqual(0);
    expect(data.totalProductsCount).toBeGreaterThan(0);
    expect(Array.isArray(data.recentOrders)).toBe(true);
    expect(Array.isArray(data.topProducts)).toBe(true);
    expect(Array.isArray(data.salesChart)).toBe(true);
  }, TEST_TIMEOUT);

  test('6. Database & Validation Error Handling', async () => {
    // 6a. Missing required fields in category creation -> 400 Bad Request
    const badCatRes = await request('/api/categories', {
      method: 'POST',
      body: {},
    });
    expect(badCatRes.status).toBe(400);
    expect(badCatRes.json.success).toBe(false);

    // 6b. Missing required fields in product creation -> 400 Bad Request
    const badProdRes = await request('/api/products', {
      method: 'POST',
      body: { name: 'Incomplete Product' },
    });
    expect(badProdRes.status).toBe(400);
    expect(badProdRes.json.success).toBe(false);

    // 6c. Fetch non-existent product ID -> 404 Not Found
    const notFoundRes = await request('/api/products/non-existent-id-999');
    expect(notFoundRes.status).toBe(404);
    expect(notFoundRes.json.success).toBe(false);

    // 6d. POS Checkout with empty cart -> 400 Bad Request
    const emptyOrderRes = await request('/api/orders', {
      method: 'POST',
      body: { items: [] },
    });
    expect(emptyOrderRes.status).toBe(400);
    expect(emptyOrderRes.json.success).toBe(false);
  }, TEST_TIMEOUT);
});
