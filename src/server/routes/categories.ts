import { Elysia, t } from 'elysia';
import { prisma } from '../../lib/db';

export const categoryRoutes = new Elysia({ prefix: '/categories' })
  // Get all categories with product count
  .get('/', async () => {
    try {
      const categories = await prisma.category.findMany({
        include: {
          _count: {
            select: { products: true },
          },
        },
        orderBy: { name: 'asc' },
      });

      const formatted = categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        productCount: cat._count.products,
        createdAt: cat.createdAt,
      }));

      return { success: true, data: formatted };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })

  // Create Category
  .post(
    '/',
    async ({ body }: any) => {
      try {
        const { name } = body;
        const category = await prisma.category.create({
          data: { name: name.trim() },
        });

        return { success: true, data: category };
      } catch (error: any) {
        return { success: false, error: error.message || 'Failed to create category' };
      }
    },
    {
      body: t.Object({
        name: t.String(),
      }),
    }
  )

  // Update Category
  .put(
    '/:id',
    async ({ params: { id }, body }: any) => {
      try {
        const { name } = body;
        const category = await prisma.category.update({
          where: { id },
          data: { name: name.trim() },
        });

        return { success: true, data: category };
      } catch (error: any) {
        return { success: false, error: error.message || 'Failed to update category' };
      }
    },
    {
      body: t.Object({
        name: t.String(),
      }),
    }
  )

  // Delete Category
  .delete('/:id', async ({ params: { id } }) => {
    try {
      await prisma.category.delete({ where: { id } });
      return { success: true, message: 'Category deleted successfully' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to delete category' };
    }
  });
