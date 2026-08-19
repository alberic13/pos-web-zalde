import { PrismaClient } from '@prisma/client-cloud';

let globalPrisma: PrismaClient | undefined;

function getPrismaClient(): PrismaClient {
  if (!globalPrisma) {
    globalPrisma = new PrismaClient();
  }
  return globalPrisma;
}

export default async function handler(req: any, res: any) {
  const prisma = getPrismaClient();
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  const jsonResponse = (data: any, status = 200) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  };

  try {
    const rawUrl = req.url || '/';
    const parsedUrl = new URL(rawUrl, `http://${req.headers?.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    // Parse JSON body for POST/PUT
    let body: any = {};
    if (method === 'POST' || method === 'PUT') {
      if (req.body) {
        body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      } else {
        const buffers: Uint8Array[] = [];
        for await (const chunk of req) {
          buffers.push(chunk);
        }
        const dataStr = Buffer.concat(buffers).toString();
        if (dataStr) {
          try {
            body = JSON.parse(dataStr);
          } catch {
            body = {};
          }
        }
      }
    }

    // Health check
    if (pathname === '/api/health' || pathname === '/health') {
      return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() });
    }

    // Dashboard Stats
    if (pathname === '/api/dashboard/stats') {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [todayOrders, monthOrders, totalProducts, lowStockProducts] = await Promise.all([
        prisma.order.findMany({
          where: { createdAt: { gte: startOfDay } },
          include: { items: true },
        }),
        prisma.order.findMany({
          where: { createdAt: { gte: startOfMonth } },
          include: { items: true },
        }),
        prisma.product.count(),
        prisma.product.findMany({
          where: { stock: { lte: 5 } },
          include: { category: true },
          take: 5,
        }),
      ]);

      const todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      const monthRevenue = monthOrders.reduce((sum, o) => sum + o.totalAmount, 0);

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const last7DaysOrders = await prisma.order.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        orderBy: { createdAt: 'asc' },
      });

      const salesMap: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        salesMap[key] = 0;
      }

      last7DaysOrders.forEach((o) => {
        const key = new Date(o.createdAt).toISOString().split('T')[0];
        if (salesMap[key] !== undefined) {
          salesMap[key] += o.totalAmount;
        }
      });

      const salesChart = Object.entries(salesMap).map(([date, total]) => ({
        date: new Date(date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }),
        total,
        revenue: total,
      }));

      const topItems = await prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      });

      const topProductsDetailed = await Promise.all(
        topItems.map(async (item) => {
          const prod = await prisma.product.findUnique({
            where: { id: item.productId },
            include: { category: true },
          });
          return {
            id: item.productId,
            name: prod?.name || 'Produk',
            category: prod?.category?.name || 'Elektronik',
            imageUrl: prod?.imageUrl || null,
            soldCount: item._sum.quantity || 0,
            revenue: (prod?.price || 0) * (item._sum.quantity || 0),
          };
        })
      );

      return jsonResponse({
        success: true,
        data: {
          todayRevenue,
          todayOrdersCount: todayOrders.length,
          monthRevenue,
          monthOrdersCount: monthOrders.length,
          totalProducts,
          totalProductsCount: totalProducts,
          lowStockCount: lowStockProducts.length,
          salesChart,
          topProducts: topProductsDetailed,
          lowStockProducts,
          recentOrders: todayOrders.slice(0, 5),
        },
      });
    }

    // Categories Endpoints
    if (pathname === '/api/categories') {
      if (method === 'GET') {
        const categories = await prisma.category.findMany({
          include: { _count: { select: { products: true } } },
          orderBy: { name: 'asc' },
        });
        const formatted = categories.map((cat) => ({
          id: cat.id,
          name: cat.name,
          productCount: cat._count.products,
          createdAt: cat.createdAt,
        }));
        return jsonResponse({ success: true, data: formatted });
      }
      if (method === 'POST') {
        const { name } = body;
        if (!name) return jsonResponse({ success: false, error: 'Category name is required' }, 400);
        const category = await prisma.category.create({ data: { name: name.trim() } });
        return jsonResponse({ success: true, data: category });
      }
    }

    const categoryIdMatch = pathname.match(/^\/api\/categories\/([^/]+)$/);
    if (categoryIdMatch) {
      const id = categoryIdMatch[1];
      if (method === 'PUT') {
        const { name } = body;
        if (!name) return jsonResponse({ success: false, error: 'Category name is required' }, 400);
        const category = await prisma.category.update({
          where: { id },
          data: { name: name.trim() },
        });
        return jsonResponse({ success: true, data: category });
      }
      if (method === 'DELETE') {
        await prisma.category.delete({ where: { id } });
        return jsonResponse({ success: true, message: 'Category deleted successfully' });
      }
    }

    // Products Endpoints
    if (pathname === '/api/products') {
      if (method === 'GET') {
        const search = parsedUrl.searchParams.get('search') || undefined;
        const categoryId = parsedUrl.searchParams.get('categoryId') || undefined;

        const where: any = {};
        if (search) {
          where.OR = [
            { name: { contains: search } },
            { sku: { contains: search } },
          ];
        }
        if (categoryId && categoryId !== 'all') {
          where.categoryId = categoryId;
        }

        const products = await prisma.product.findMany({
          where,
          include: { category: true },
          orderBy: { updatedAt: 'desc' },
        });
        return jsonResponse({ success: true, data: products });
      }

      if (method === 'POST') {
        const { sku, name, price, costPrice, stock, categoryId, imageUrl } = body;
        if (!name || price === undefined || stock === undefined || !categoryId) {
          return jsonResponse({ success: false, error: 'Missing required fields' }, 400);
        }
        const finalSku = sku && sku.trim() !== '' ? sku : `PRD-${Date.now().toString().slice(-6)}`;
        const product = await prisma.product.create({
          data: {
            sku: finalSku,
            name,
            price: Number(price),
            costPrice: costPrice ? Number(costPrice) : null,
            stock: Number(stock),
            categoryId,
            imageUrl: imageUrl || null,
          },
          include: { category: true },
        });
        return jsonResponse({ success: true, data: product });
      }
    }

    const productIdMatch = pathname.match(/^\/api\/products\/([^/]+)$/);
    if (productIdMatch) {
      const id = productIdMatch[1];
      if (method === 'GET') {
        const product = await prisma.product.findUnique({
          where: { id },
          include: { category: true },
        });
        if (!product) return jsonResponse({ success: false, error: 'Product not found' }, 404);
        return jsonResponse({ success: true, data: product });
      }
      if (method === 'PUT') {
        const { sku, name, price, costPrice, stock, categoryId, imageUrl } = body;
        const product = await prisma.product.update({
          where: { id },
          data: {
            sku,
            name,
            price: Number(price),
            costPrice: costPrice ? Number(costPrice) : null,
            stock: Number(stock),
            categoryId,
            imageUrl: imageUrl || null,
          },
          include: { category: true },
        });
        return jsonResponse({ success: true, data: product });
      }
      if (method === 'DELETE') {
        await prisma.product.delete({ where: { id } });
        return jsonResponse({ success: true, message: 'Product deleted successfully' });
      }
    }

    // Orders Endpoints
    if (pathname === '/api/orders') {
      if (method === 'GET') {
        const orders = await prisma.order.findMany({
          include: { items: { include: { product: true } } },
          orderBy: { createdAt: 'desc' },
        });
        return jsonResponse({ success: true, data: orders });
      }

      if (method === 'POST') {
        const { items, paymentMethod, paymentAmount } = body;
        if (!items || !Array.isArray(items) || items.length === 0) {
          return jsonResponse({ success: false, error: 'Cart items required' }, 400);
        }

        const result = await prisma.$transaction(async (tx) => {
          const orderItemsToCreate = await Promise.all(
            items.map(async (item: any) => {
              let itemPrice = Number(item.price ?? item.unitPrice);
              if (isNaN(itemPrice) || itemPrice <= 0) {
                const prod = await tx.product.findUnique({ where: { id: item.productId } });
                itemPrice = prod?.price || 0;
              }
              return {
                productId: item.productId,
                quantity: Number(item.quantity || 1),
                price: itemPrice,
              };
            })
          );

          const totalAmount = orderItemsToCreate.reduce((sum, i) => sum + i.price * i.quantity, 0);
          const changeAmount = (paymentAmount || totalAmount) - totalAmount;
          const orderNumber = `ORD-${Date.now()}`;

          const createdOrder = await tx.order.create({
            data: {
              orderNumber,
              totalAmount,
              paymentAmount: paymentAmount || totalAmount,
              changeAmount: Math.max(0, changeAmount),
              paymentMethod: paymentMethod || 'CASH',
              items: { create: orderItemsToCreate },
            },
            include: { items: { include: { product: true } } },
          });

          for (const item of items) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.quantity } },
            });
          }
          return createdOrder;
        });

        return jsonResponse({ success: true, data: result, message: 'Transaksi berhasil diselesaikan' });
      }
    }

    const orderIdMatch = pathname.match(/^\/api\/orders\/([^/]+)$/);
    if (orderIdMatch) {
      const id = orderIdMatch[1];
      if (method === 'GET') {
        const order = await prisma.order.findUnique({
          where: { id },
          include: { items: { include: { product: true } } },
        });
        if (!order) return jsonResponse({ success: false, error: 'Order not found' }, 404);
        return jsonResponse({ success: true, data: order });
      }
    }

    return jsonResponse({ success: false, error: `Endpoint '${pathname}' not found` }, 404);
  } catch (error: any) {
    console.error('API Error:', error);
    return jsonResponse({ success: false, error: error.message || 'Internal Server Error' }, 500);
  }
}

// Local Development Server Listener (Runs on http://localhost:3000 when executed locally)
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  const http = require('http');
  const PORT = process.env.PORT || 3000;
  const server = http.createServer((req: any, res: any) => {
    handler(req, res);
  });
  server.listen(PORT, () => {
    console.log(`🚀 POS Local API Server running at http://localhost:${PORT}`);
  });
}
