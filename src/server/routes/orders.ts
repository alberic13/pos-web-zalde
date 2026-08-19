import { Elysia, t } from 'elysia';
import { prisma } from '../../lib/db';

export const orderRoutes = new Elysia({ prefix: '/orders' })
  // Get all orders
  .get('/', async ({ query }) => {
    try {
      const search = query.search as string | undefined;

      const where: any = {};
      if (search) {
        where.orderNumber = { contains: search };
      }

      const orders = await prisma.order.findMany({
        where,
        include: {
          items: {
            include: { product: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return { success: true, data: orders };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })

  // Get order detail by ID
  .get('/:id', async ({ params: { id } }) => {
    try {
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          items: {
            include: { product: true },
          },
        },
      });
      if (!order) return { success: false, error: 'Order not found' };
      return { success: true, data: order };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })

  // Create Checkout Order (Atomic Transaction & Automatic Stock Reduction)
  .post(
    '/',
    async ({ body }: any) => {
      try {
        const { items, paymentAmount, paymentMethod = 'CASH' } = body;

        if (!items || items.length === 0) {
          return { success: false, error: 'Cart items cannot be empty' };
        }

        // Fetch products to verify stock & prices
        const productIds = items.map((i: any) => i.productId);
        const products = await prisma.product.findMany({
          where: { id: { in: productIds } },
        });

        let totalAmount = 0;
        const orderItemsToCreate: { productId: string; quantity: number; price: number }[] = [];

        for (const item of items) {
          const product = products.find((p) => p.id === item.productId);
          if (!product) {
            return { success: false, error: `Product ID ${item.productId} not found` };
          }
          if (product.stock < item.quantity) {
            return {
              success: false,
              error: `Stok produk "${product.name}" tidak mencukupi (Tersisa: ${product.stock}, Diminta: ${item.quantity})`,
            };
          }

          const itemTotal = product.price * item.quantity;
          totalAmount += itemTotal;

          orderItemsToCreate.push({
            productId: product.id,
            quantity: item.quantity,
            price: product.price,
          });
        }

        if (paymentAmount < totalAmount) {
          return {
            success: false,
            error: `Nominal pembayaran kurang. Total: Rp ${totalAmount.toLocaleString('id-ID')}, Dibayar: Rp ${paymentAmount.toLocaleString('id-ID')}`,
          };
        }

        const changeAmount = paymentAmount - totalAmount;
        const orderNumber = `ORD-${Date.now().toString().slice(-8)}`;

        // Execute in Atomic Transaction: Create Order & Deduct Stock
        const result = await prisma.$transaction(async (tx) => {
          // 1. Create order record
          const createdOrder = await tx.order.create({
            data: {
              orderNumber,
              totalAmount,
              paymentAmount,
              changeAmount,
              paymentMethod,
              items: {
                create: orderItemsToCreate,
              },
            },
            include: {
              items: {
                include: { product: true },
              },
            },
          });

          // 2. Reduce stock for each product
          for (const item of items) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.quantity } },
            });
          }

          return createdOrder;
        });

        return { success: true, data: result, message: 'Transaksi berhasil diselesaikan' };
      } catch (error: any) {
        console.error('Checkout error:', error);
        return { success: false, error: error.message || 'Gagal memproses transaksi' };
      }
    },
    {
      body: t.Object({
        items: t.Array(
          t.Object({
            productId: t.String(),
            quantity: t.Number(),
          })
        ),
        paymentAmount: t.Number(),
        paymentMethod: t.Optional(t.String()),
      }),
    }
  );
