import { execSync } from 'child_process';
import { PrismaClient as LocalPrismaClient } from '@prisma/client-local';

const LIVE_VERCEL_API = 'https://pos-web-zalde.vercel.app/api';

async function fetchFromLiveApi(endpoint: string) {
  const res = await fetch(`${LIVE_VERCEL_API}${endpoint}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch from live Vercel API ${endpoint}: ${res.statusText}`);
  }
  const json = await res.json();
  return json.data || json;
}

async function syncFromNeonToMySQL() {
  console.log('🔄 Syncing live data from Neon Cloud (via Vercel API) to Local XAMPP MySQL...');

  try {
    // 1. Fetch live data from Neon Cloud via Vercel Production API
    console.log('📡 Fetching live categories, products, and orders from Neon Cloud...');
    const [categories, products, orders] = await Promise.all([
      fetchFromLiveApi('/categories'),
      fetchFromLiveApi('/products?categoryId=all'),
      fetchFromLiveApi('/orders'),
    ]);

    console.log(`📦 Received from Neon Cloud:`);
    console.log(`   - Kategori: ${categories.length}`);
    console.log(`   - Produk: ${products.length}`);
    console.log(`   - Transaksi (Order): ${orders.length}`);

    // 2. Ensure local MySQL database structure is synced
    console.log('⚙️ Pushing local MySQL schema...');
    execSync('npx prisma db push --schema=prisma/schema.local.prisma', { stdio: 'inherit' });

    // 3. Connect to local XAMPP MySQL database
    const localPrisma = new LocalPrismaClient();

    console.log('🧹 Clearing existing data in local MySQL database...');
    await localPrisma.orderItem.deleteMany();
    await localPrisma.order.deleteMany();
    await localPrisma.product.deleteMany();
    await localPrisma.category.deleteMany();

    // 4. Migrate Categories to local MySQL
    console.log('🚀 Migrating categories to local XAMPP MySQL...');
    for (const cat of categories) {
      await localPrisma.category.create({
        data: {
          id: cat.id,
          name: cat.name,
          createdAt: cat.createdAt ? new Date(cat.createdAt) : new Date(),
        },
      });
    }

    // 5. Migrate Products to local MySQL
    console.log('🚀 Migrating products to local XAMPP MySQL...');
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
          imageUrl: prod.imageUrl || null,
          createdAt: prod.createdAt ? new Date(prod.createdAt) : new Date(),
          updatedAt: prod.updatedAt ? new Date(prod.updatedAt) : new Date(),
        },
      });
    }

    // 6. Migrate Orders and OrderItems to local MySQL
    console.log('🚀 Migrating orders & items to local XAMPP MySQL...');
    for (const ord of orders) {
      await localPrisma.order.create({
        data: {
          id: ord.id,
          orderNumber: ord.orderNumber,
          totalAmount: Number(ord.totalAmount),
          paymentAmount: Number(ord.paymentAmount),
          changeAmount: Number(ord.changeAmount),
          paymentMethod: ord.paymentMethod || 'CASH',
          createdAt: ord.createdAt ? new Date(ord.createdAt) : new Date(),
          items: {
            create: (ord.items || []).map((item: any) => ({
              id: item.id,
              productId: item.productId,
              quantity: Number(item.quantity),
              price: Number(item.price),
            })),
          },
        },
      });
    }

    console.log('✅ Synchronization Completed Successfully!');
    console.log(`🎉 Local XAMPP MySQL database is now 100% synced with Neon PostgreSQL Cloud!`);
    await localPrisma.$disconnect();
  } catch (error) {
    console.error('❌ Error during synchronization:', error);
    process.exit(1);
  }
}

syncFromNeonToMySQL();
