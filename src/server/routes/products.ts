import { Elysia, t } from 'elysia';
import { prisma } from '../../lib/db';

export const productRoutes = new Elysia({ prefix: '/products' })
  // List all products with optional search and category filter
  .get('/', async ({ query }) => {
    try {
      const search = query.search as string | undefined;
      const categoryId = query.categoryId as string | undefined;

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

      return { success: true, data: products };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })

  // Get single product by ID
  .get('/:id', async ({ params: { id } }) => {
    try {
      const product = await prisma.product.findUnique({
        where: { id },
        include: { category: true },
      });
      if (!product) return { success: false, error: 'Product not found' };
      return { success: true, data: product };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })

  // Create Product
  .post(
    '/',
    async ({ body }: any) => {
      try {
        const { sku, name, price, costPrice, stock, categoryId, imageUrl } = body;

        // Auto-generate SKU if not provided
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

        return { success: true, data: product };
      } catch (error: any) {
        return { success: false, error: error.message || 'Failed to create product' };
      }
    },
    {
      body: t.Object({
        sku: t.Optional(t.String()),
        name: t.String(),
        price: t.Number(),
        costPrice: t.Optional(t.Number()),
        stock: t.Number(),
        categoryId: t.String(),
        imageUrl: t.Optional(t.String()),
      }),
    }
  )

  // Update Product
  .put(
    '/:id',
    async ({ params: { id }, body }: any) => {
      try {
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

        return { success: true, data: product };
      } catch (error: any) {
        return { success: false, error: error.message || 'Failed to update product' };
      }
    },
    {
      body: t.Object({
        sku: t.String(),
        name: t.String(),
        price: t.Number(),
        costPrice: t.Optional(t.Number()),
        stock: t.Number(),
        categoryId: t.String(),
        imageUrl: t.Optional(t.String()),
      }),
    }
  )

  // Delete Product
  .delete('/:id', async ({ params: { id } }) => {
    try {
      await prisma.product.delete({ where: { id } });
      return { success: true, message: 'Product deleted successfully' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to delete product' };
    }
  });
