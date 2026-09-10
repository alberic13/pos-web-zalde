import { Elysia } from 'elysia';
import { prisma } from '../db';

export const orderRoutes = new Elysia({ prefix: '/api/orders' })
  .get('/', async () => {
    const orders = await prisma.order.findMany({
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: orders };
  })
  .post('/', async ({ body, set }: { body: any; set: any }) => {
    const { items, paymentMethod, paymentAmount } = body || {};
    if (!items || !Array.isArray(items) || items.length === 0) {
      set.status = 400;
      return { success: false, error: 'Cart items required' };
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

    return {
      success: true,
      data: result,
      message: 'Transaksi berhasil diselesaikan',
    };
  });
