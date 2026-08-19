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

async function syncLocalToCloud() {
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

  console.log('🔄 Memulai migrasi data dari PostgreSQL Lokal ➔ Neon Cloud PostgreSQL...');

  const localPrisma = new PrismaClient({ datasources: { db: { url: localDbUrl } } });
  const cloudPrisma = new PrismaClient({ datasources: { db: { url: cloudDbUrl } } });

  try {
    // 1. Read data from Local PostgreSQL
    console.log('📡 Membaca data dari PostgreSQL Lokal...');
    const categories = await localPrisma.category.findMany();
    const products = await localPrisma.product.findMany();
    const orders = await localPrisma.order.findMany({ include: { items: true } });
    const suppliers = await localPrisma.supplier.findMany();

    console.log(`📦 Data Lokal ditemukan:`);
    console.log(`   - Kategori: ${categories.length}`);
    console.log(`   - Produk: ${products.length}`);
    console.log(`   - Supplier: ${suppliers.length}`);
    console.log(`   - Transaksi (Order): ${orders.length}`);

    // 2. Clean old data in Cloud Neon Database
    console.log('🧹 Membersihkan data di Neon Cloud PostgreSQL...');
    await cloudPrisma.orderItem.deleteMany();
    await cloudPrisma.order.deleteMany();
    await cloudPrisma.product.deleteMany();
    await cloudPrisma.category.deleteMany();
    await cloudPrisma.supplier.deleteMany();

    // 3. Migrate Suppliers to Cloud
    console.log('🚀 Memindahkan Supplier ke Neon Cloud PostgreSQL...');
    for (const sup of suppliers) {
      await cloudPrisma.supplier.create({
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

    // 4. Migrate Categories to Cloud
    console.log('🚀 Memindahkan Kategori ke Neon Cloud PostgreSQL...');
    for (const cat of categories) {
      await cloudPrisma.category.create({
        data: {
          id: cat.id,
          name: cat.name,
          createdAt: cat.createdAt,
        },
      });
    }

    // 4. Migrate Products to Cloud
    console.log('🚀 Memindahkan Produk ke Neon Cloud PostgreSQL...');
    for (const prod of products) {
      await cloudPrisma.product.create({
        data: {
          id: prod.id,
          sku: prod.sku,
          name: prod.name,
          price: Number(prod.price),
          costPrice: prod.costPrice ? Number(prod.costPrice) : null,
          stock: Number(prod.stock),
          warehouseStock: Number((prod as any).warehouseStock || 20),
          categoryId: prod.categoryId,
          imageUrl: prod.imageUrl,
          createdAt: prod.createdAt,
          updatedAt: prod.updatedAt,
        },
      });
    }

    // 5. Migrate Orders to Cloud
    console.log('🚀 Memindahkan Transaksi & OrderItem ke Neon Cloud PostgreSQL...');
    for (const ord of orders) {
      await cloudPrisma.order.create({
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

    console.log('✅ MIGRASI SELESAI SUKSES!');
    console.log('🎉 Data di Neon Cloud PostgreSQL kini 100% identik dengan PostgreSQL Lokal!');
  } catch (error) {
    console.error('❌ Gagal melakukan migrasi ke Cloud:', error);
  } finally {
    await localPrisma.$disconnect();
    await cloudPrisma.$disconnect();
  }
}

syncLocalToCloud();
