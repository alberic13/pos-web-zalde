import { Elysia } from 'elysia';
import { prisma } from '../db';

export const productRoutes = new Elysia({ prefix: '/api/products' })
  .get('/', async ({ query }) => {
    const search = query.search as string | undefined;
    const categoryId = query.categoryId as string | undefined;

    const where: any = {};

    if (categoryId && categoryId !== 'all') {
      where.categoryId = categoryId;
    }

    if (search && search.trim() !== '') {
      const words = search.trim().split(/\s+/).filter(Boolean);
      if (words.length > 0) {
        where.AND = words.map((word) => ({
          OR: [
            { name: { contains: word, mode: 'insensitive' } },
            { sku: { contains: word, mode: 'insensitive' } },
            { category: { name: { contains: word, mode: 'insensitive' } } },
          ],
        }));
      }
    }

    const products = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { updatedAt: 'desc' },
    });
    return { success: true, data: products };
  })
  .post('/', async ({ body, set }: { body: any; set: any }) => {
    const { sku, name, price, costPrice, stock, warehouseStock, categoryId, imageUrl } = body || {};
    if (!name || price === undefined || stock === undefined || !categoryId) {
      set.status = 400;
      return { success: false, error: 'Missing required fields' };
    }
    const finalSku = sku && sku.trim() !== '' ? sku : `PRD-${Date.now().toString().slice(-6)}`;
    const product = await prisma.product.create({
      data: {
        sku: finalSku,
        name,
        price: Number(price),
        costPrice: costPrice ? Number(costPrice) : null,
        stock: Number(stock),
        warehouseStock: warehouseStock !== undefined ? Number(warehouseStock) : 20,
        categoryId,
        imageUrl: imageUrl || null,
      },
      include: { category: true },
    });
    return { success: true, data: product };
  })
  .post('/:id/transfer-to-display', async ({ params: { id }, body, set }: { params: { id: string }; body: any; set: any }) => {
    const transferQty = Number(body?.amount);
    if (isNaN(transferQty) || transferQty <= 0) {
      set.status = 400;
      return { success: false, error: 'Jumlah transfer harus berupa angka positif' };
    }

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      set.status = 404;
      return { success: false, error: 'Produk tidak ditemukan' };
    }

    if (product.warehouseStock < transferQty) {
      set.status = 400;
      return {
        success: false,
        error: `Stok gudang tidak mencukupi. Sisa stok gudang: ${product.warehouseStock} unit.`,
      };
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        warehouseStock: { decrement: transferQty },
        stock: { increment: transferQty },
      },
      include: { category: true },
    });

    return {
      success: true,
      message: `Berhasil memindahkan ${transferQty} unit dari Gudang ke Etalase Kasir.`,
      data: updated,
    };
  })
  .get('/:id', async ({ params: { id }, set }: { params: { id: string }; set: any }) => {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product) {
      set.status = 404;
      return { success: false, error: 'Product not found' };
    }
    return { success: true, data: product };
  })
  .put('/:id', async ({ params: { id }, body }: { params: { id: string }; body: any }) => {
    const { sku, name, price, costPrice, stock, warehouseStock, categoryId, imageUrl } = body || {};
    const updateData: any = {
      sku,
      name,
      price: Number(price),
      costPrice: costPrice ? Number(costPrice) : null,
      stock: Number(stock),
      categoryId,
      imageUrl: imageUrl || null,
    };
    if (warehouseStock !== undefined) {
      updateData.warehouseStock = Number(warehouseStock);
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });
    return { success: true, data: product };
  })
  .delete('/:id', async ({ params: { id } }: { params: { id: string } }) => {
    await prisma.product.delete({ where: { id } });
    return { success: true, message: 'Product deleted successfully' };
  });
