import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: ['error'],
    });
  }
  return globalForPrisma.prisma;
}

export default async function handler(req: any, res: any) {
  const jsonResponse = (data: any, status = 200) => {
    try {
      res.statusCode = status;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
    } catch (e) {
      console.error('Failed to send JSON response:', e);
    }
  };

  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.statusCode = 200;
      return res.end();
    }

    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const reqUrl = req.url || '/';
    const fullUrl = reqUrl.startsWith('http') ? reqUrl : `${protocol}://${host}${reqUrl}`;
    const url = new URL(fullUrl);

    let pathname = url.pathname;
    if (pathname.startsWith('/api')) {
      pathname = pathname.replace(/^\/api/, '') || '/';
    }
    const method = req.method || 'GET';

    const getJsonBody = () => {
      if (!req.body) return {};
      if (typeof req.body === 'object') return req.body;
      try {
        return JSON.parse(req.body);
      } catch {
        return {};
      }
    };

    const prisma = getPrisma();

    // 1. Health Check
    if (pathname === '/health' || pathname === '/') {
      return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() });
    }

    // 2. Dashboard Stats
    if (pathname === '/dashboard/stats' && method === 'GET') {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const todayOrders = await prisma.order.aggregate({
        where: { createdAt: { gte: startOfToday } },
        _sum: { totalAmount: true },
        _count: { id: true },
      });

      const monthOrders = await prisma.order.aggregate({
        where: { createdAt: { gte: startOfMonth } },
        _sum: { totalAmount: true },
        _count: { id: true },
      });

      const totalProductsCount = await prisma.product.count();
      const lowStockProducts = await prisma.product.findMany({
        where: { stock: { lte: 5 } },
        include: { category: true },
        take: 5,
      });

      const recentOrders = await prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: { product: true },
          },
        },
      });

      const topItems = await prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      });

      const topProductIds = topItems.map((item) => item.productId);
      const topProductsData = await prisma.product.findMany({
        where: { id: { in: topProductIds } },
        include: { category: true },
      });

      const topProducts = topItems.map((item) => {
        const prod = topProductsData.find((p) => p.id === item.productId);
        return {
          id: item.productId,
          name: prod?.name || 'Unknown Product',
          category: prod?.category?.name || 'Uncategorized',
          soldCount: item._sum.quantity || 0,
          price: prod?.price || 0,
          imageUrl: prod?.imageUrl,
        };
      });

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const allRecentOrders = await prisma.order.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true, totalAmount: true },
      });

      const salesByDate: Record<string, { date: string; revenue: number; orders: number }> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateKey = d.toISOString().split('T')[0];
        const displayLabel = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
        salesByDate[dateKey] = { date: displayLabel, revenue: 0, orders: 0 };
      }

      for (const order of allRecentOrders) {
        const dateKey = new Date(order.createdAt).toISOString().split('T')[0];
        if (salesByDate[dateKey]) {
          salesByDate[dateKey].revenue += order.totalAmount;
          salesByDate[dateKey].orders += 1;
        }
      }

      return jsonResponse({
        success: true,
        data: {
          todayRevenue: todayOrders._sum.totalAmount || 0,
          todayOrdersCount: todayOrders._count.id || 0,
          monthRevenue: monthOrders._sum.totalAmount || 0,
          monthOrdersCount: monthOrders._count.id || 0,
          totalProductsCount,
          lowStockCount: lowStockProducts.length,
          lowStockProducts,
          recentOrders,
          topProducts,
          salesChart: Object.values(salesByDate),
        },
      });
    }

    // 3. Categories
    if (pathname === '/categories') {
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
        const body = getJsonBody();
        const category = await prisma.category.create({
          data: { name: (body.name || '').trim() },
        });
        return jsonResponse({ success: true, data: category });
      }
    }

    const categoryIdMatch = pathname.match(/^\/categories\/([^/]+)$/);
    if (categoryIdMatch) {
      const id = categoryIdMatch[1];
      if (method === 'PUT') {
        const body = getJsonBody();
        const category = await prisma.category.update({
          where: { id },
          data: { name: (body.name || '').trim() },
        });
        return jsonResponse({ success: true, data: category });
      }
      if (method === 'DELETE') {
        await prisma.category.delete({ where: { id } });
        return jsonResponse({ success: true, message: 'Category deleted' });
      }
    }

    // 4. Products
    if (pathname === '/products') {
      if (method === 'GET') {
        const search = url.searchParams.get('search') || undefined;
        const categoryId = url.searchParams.get('categoryId') || undefined;
        const where: any = {};
        if (search) {
          where.OR = [{ name: { contains: search } }, { sku: { contains: search } }];
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
        const body = getJsonBody();
        const finalSku = body.sku && body.sku.trim() !== '' ? body.sku : `PRD-${Date.now().toString().slice(-6)}`;
        const product = await prisma.product.create({
          data: {
            sku: finalSku,
            name: body.name,
            price: Number(body.price),
            costPrice: body.costPrice ? Number(body.costPrice) : null,
            stock: Number(body.stock),
            categoryId: body.categoryId,
            imageUrl: body.imageUrl || null,
          },
          include: { category: true },
        });
        return jsonResponse({ success: true, data: product });
      }
    }

    const productIdMatch = pathname.match(/^\/products\/([^/]+)$/);
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
        const body = getJsonBody();
        const product = await prisma.product.update({
          where: { id },
          data: {
            sku: body.sku,
            name: body.name,
            price: Number(body.price),
            costPrice: body.costPrice ? Number(body.costPrice) : null,
            stock: Number(body.stock),
            categoryId: body.categoryId,
            imageUrl: body.imageUrl || null,
          },
          include: { category: true },
        });
        return jsonResponse({ success: true, data: product });
      }
      if (method === 'DELETE') {
        await prisma.product.delete({ where: { id } });
        return jsonResponse({ success: true, message: 'Product deleted' });
      }
    }

    // 5. Orders
    if (pathname === '/orders') {
      if (method === 'GET') {
        const search = url.searchParams.get('search') || undefined;
        const where: any = {};
        if (search) where.orderNumber = { contains: search };
        const orders = await prisma.order.findMany({
          where,
          include: { items: { include: { product: true } } },
          orderBy: { createdAt: 'desc' },
        });
        return jsonResponse({ success: true, data: orders });
      }

      if (method === 'POST') {
        const body = getJsonBody();
        const { items, paymentAmount, paymentMethod = 'CASH' } = body;
        if (!items || items.length === 0) {
          return jsonResponse({ success: false, error: 'Cart items cannot be empty' }, 400);
        }

        const productIds = items.map((i: any) => i.productId);
        const products = await prisma.product.findMany({
          where: { id: { in: productIds } },
        });

        let totalAmount = 0;
        const orderItemsToCreate: { productId: string; quantity: number; price: number }[] = [];

        for (const item of items) {
          const product = products.find((p) => p.id === item.productId);
          if (!product) {
            return jsonResponse({ success: false, error: `Product ID ${item.productId} not found` }, 400);
          }
          if (product.stock < item.quantity) {
            return jsonResponse(
              {
                success: false,
                error: `Stok produk "${product.name}" tidak mencukupi (Tersisa: ${product.stock}, Diminta: ${item.quantity})`,
              },
              400
            );
          }
          totalAmount += product.price * item.quantity;
          orderItemsToCreate.push({
            productId: product.id,
            quantity: item.quantity,
            price: product.price,
          });
        }

        if (paymentAmount < totalAmount) {
          return jsonResponse(
            {
              success: false,
              error: `Nominal pembayaran kurang. Total: Rp ${totalAmount.toLocaleString('id-ID')}, Dibayar: Rp ${paymentAmount.toLocaleString('id-ID')}`,
            },
            400
          );
        }

        const changeAmount = paymentAmount - totalAmount;
        const orderNumber = `ORD-${Date.now().toString().slice(-8)}`;

        const result = await prisma.$transaction(async (tx) => {
          const createdOrder = await tx.order.create({
            data: {
              orderNumber,
              totalAmount,
              paymentAmount,
              changeAmount,
              paymentMethod,
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

    const orderIdMatch = pathname.match(/^\/orders\/([^/]+)$/);
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
