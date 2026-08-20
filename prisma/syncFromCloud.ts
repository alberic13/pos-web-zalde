import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf-8');
    for (const line of envFile.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const val = valueParts.join('=').replace(/^["']|["']$/g, '');
          process.env[key.trim()] = val.trim();
        }
      }
    }
  }
}

loadEnv();

async function syncFromCloudToLocal() {
  const localDbUrl = process.env.DATABASE_URL;
  const cloudDbUrl = process.env.NEON_DATABASE_URL;

  if (!cloudDbUrl) {
    console.error('❌ ERROR: NEON_DATABASE_URL tidak ditemukan di file .env!');
    process.exit(1);
  }

  if (!localDbUrl) {
    console.error('❌ ERROR: DATABASE_URL lokal tidak ditemukan di file .env!');
    process.exit(1);
  }

  console.log('🔄 Memulai sinkronisasi data dari Neon Cloud PostgreSQL ke PostgreSQL Lokal...');

  const cloudPrisma = new PrismaClient({ datasources: { db: { url: cloudDbUrl } } });
  const localPrisma = new PrismaClient({ datasources: { db: { url: localDbUrl } } });

  try {
    // 1. Ambil data dari Cloud Neon
    console.log('📡 Membaca data dari Neon Cloud PostgreSQL...');
    const categories = await cloudPrisma.category.findMany();
    const products = await cloudPrisma.product.findMany();
    const orders = await cloudPrisma.order.findMany({ include: { items: true } });
    const suppliers = await cloudPrisma.supplier.findMany();

    console.log(`📦 Data dari Cloud ditemukan:`);
    console.log(`   - Kategori: ${categories.length}`);
    console.log(`   - Produk: ${products.length}`);
    console.log(`   - Supplier: ${suppliers.length}`);
    console.log(`   - Transaksi (Order): ${orders.length}`);

    // 2. Bersihkan data lama di database lokal
    console.log('🧹 Membersihkan data lama di PostgreSQL lokal...');
    await localPrisma.orderItem.deleteMany();
    await localPrisma.order.deleteMany();
    await localPrisma.product.deleteMany();
    await localPrisma.category.deleteMany();
    await localPrisma.supplier.deleteMany();

    // 3. Masukkan Supplier ke Lokal
    console.log('🚀 Memindahkan Supplier ke PostgreSQL Lokal...');
    for (const sup of suppliers) {
      await localPrisma.supplier.create({
        data: {
          id: sup.id,
          companyName: sup.companyName,
          contactPerson: sup.contactPerson,
          phone: sup.phone,
          whatsapp: sup.whatsapp,
          email: sup.email,
          address: sup.address,
          categorySupply: sup.categorySupply,
          notes: sup.notes,
          createdAt: sup.createdAt,
          updatedAt: sup.updatedAt,
        },
      });
    }

    // 4. Masukkan Kategori ke Lokal
    console.log('🚀 Memindahkan Kategori ke PostgreSQL Lokal...');
    for (const cat of categories) {
      await localPrisma.category.create({
        data: {
          id: cat.id,
          name: cat.name,
          createdAt: cat.createdAt,
        },
      });
    }

    // 4. Masukkan Produk ke Lokal
    console.log('🚀 Memindahkan Produk ke PostgreSQL Lokal...');
    for (const prod of products) {
      await localPrisma.product.create({
        data: {
          id: prod.id,
          sku: prod.sku,
          name: prod.name,
          price: Number(prod.price),
          costPrice: prod.costPrice ? Number(prod.costPrice) : null,
          stock: Number(prod.stock),
          categoryId: prod.categoryId,
          imageUrl: prod.imageUrl,
          createdAt: prod.createdAt,
          updatedAt: prod.updatedAt,
        },
      });
    }

    // 5. Masukkan Transaksi ke Lokal
    console.log('🚀 Memindahkan Transaksi & OrderItem ke PostgreSQL Lokal...');
    for (const ord of orders) {
      await localPrisma.order.create({
        data: {
          id: ord.id,
          orderNumber: ord.orderNumber,
          totalAmount: Number(ord.totalAmount),
          paymentAmount: Number(ord.paymentAmount),
          changeAmount: Number(ord.changeAmount),
          paymentMethod: ord.paymentMethod,
          createdAt: ord.createdAt,
          items: {
            create: (ord.items || []).map((item) => ({
              id: item.id,
              productId: item.productId,
              quantity: Number(item.quantity),
              price: Number(item.price),
            })),
          },
        },
      });
    }

    console.log('✅ SINKRONISASI SELESAI!');
    console.log('🎉 PostgreSQL Lokal kini 100% identik dengan Neon Cloud PostgreSQL!');
  } catch (error) {
    console.error('❌ Gagal melakukan sinkronisasi:', error);
  } finally {
    await cloudPrisma.$disconnect();
    await localPrisma.$disconnect();
  }
}

syncFromCloudToLocal();
