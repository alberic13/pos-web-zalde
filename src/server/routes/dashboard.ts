import { Elysia } from 'elysia';
import { prisma } from '../../lib/db';

export const dashboardRoutes = new Elysia({ prefix: '/dashboard' })
  .get('/stats', async () => {
    try {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // 1. Total Revenue Today
      const todayOrders = await prisma.order.aggregate({
        where: { createdAt: { gte: startOfToday } },
        _sum: { totalAmount: true },
        _count: { id: true },
      });

      // 2. Total Revenue Month
      const monthOrders = await prisma.order.aggregate({
        where: { createdAt: { gte: startOfMonth } },
        _sum: { totalAmount: true },
        _count: { id: true },
      });

      // 3. Products metrics
      const totalProductsCount = await prisma.product.count();
      const lowStockProducts = await prisma.product.findMany({
        where: { stock: { lte: 5 } },
        include: { category: true },
        take: 5,
      });

      // 4. Recent Orders
      const recentOrders = await prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: { product: true },
          },
        },
      });

      // 5. Top Selling Products
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

      // 6. Sales Chart for last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const allRecentOrders = await prisma.order.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true, totalAmount: true },
      });

      // Group by date string (YYYY-MM-DD)
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

      const salesChart = Object.values(salesByDate);

      return {
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
          salesChart,
        },
      };
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      return { success: false, error: error.message || 'Failed to fetch dashboard stats' };
    }
  });
