import { Elysia } from 'elysia';
import { prisma } from '../db';

export const categoryRoutes = new Elysia({ prefix: '/api/categories' })
  .get('/', async () => {
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
    return { success: true, data: formatted };
  })
  .post('/', async ({ body, set }: { body: any; set: any }) => {
    const name = body?.name;
    if (!name || typeof name !== 'string' || name.trim() === '') {
      set.status = 400;
      return { success: false, error: 'Category name is required' };
    }
    const category = await prisma.category.create({
      data: { name: name.trim() },
    });
    return { success: true, data: category };
  })
  .put('/:id', async ({ params: { id }, body, set }: { params: { id: string }; body: any; set: any }) => {
    const name = body?.name;
    if (!name || typeof name !== 'string' || name.trim() === '') {
      set.status = 400;
      return { success: false, error: 'Category name is required' };
    }
    const category = await prisma.category.update({
      where: { id },
      data: { name: name.trim() },
    });
    return { success: true, data: category };
  })
  .delete('/:id', async ({ params: { id } }: { params: { id: string } }) => {
    await prisma.category.delete({ where: { id } });
    return { success: true, message: 'Category deleted successfully' };
  });
