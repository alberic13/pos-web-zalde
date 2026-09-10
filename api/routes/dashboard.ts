import { Elysia } from 'elysia';
import { prisma } from '../db';

async function getDashboardStats() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

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
    date: new Date(date).toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }),
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

  return {
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
  };
}

export const dashboardRoutes = new Elysia()
  .get('/api/dashboard/stats', getDashboardStats)
  .get('/dashboard/stats', getDashboardStats);
