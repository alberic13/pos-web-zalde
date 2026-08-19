import { execSync } from 'child_process';
import { PrismaClient as LocalPrismaClient } from '@prisma/client-local';
import { PrismaClient as CloudPrismaClient } from '@prisma/client-cloud';
import fs from 'fs';
import path from 'path';

// Helper function to load .env variables
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

async function syncFromMySQLToNeon() {
  console.log('🔄 Syncing local XAMPP MySQL data to Neon Cloud (PostgreSQL)...');

  const localDbUrl = process.env.DATABASE_URL || 'mysql://root:@localhost:3306/pos_zalde_dev';
  const neonDbUrl = process.env.NEON_DATABASE_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL_NEON;

  if (!neonDbUrl || neonDbUrl.startsWith('mysql:')) {
    console.error('❌ ERROR: Connection string for Neon Cloud PostgreSQL not found!');
    console.error('👉 Please add NEON_DATABASE_URL to your .env file:');
    console.error('   NEON_DATABASE_URL="postgresql://user:password@ep-xyz.neon.tech/neondb?sslmode=require"');
    process.exit(1);
  }

  try {
    // 1. Fetch local data from XAMPP MySQL using LocalPrismaClient (@prisma/client-local)
    console.log('📡 Reading data from Local XAMPP MySQL database...');
    const localPrisma = new LocalPrismaClient({
      datasources: { db: { url: localDbUrl } },
    });

    const categories = await localPrisma.category.findMany();
    const products = await localPrisma.product.findMany();
    const orders = await localPrisma.order.findMany({
      include: { items: true },
    });

    console.log(`📦 Local MySQL data found:`);
    console.log(`   - Kategori: ${categories.length}`);
    console.log(`   - Produk: ${products.length}`);
    console.log(`   - Transaksi (Order): ${orders.length}`);

    await localPrisma.$disconnect();

    // 2. Ensure schema is pushed to Neon PostgreSQL
    console.log('⚙️ Pushing PostgreSQL schema to Neon Cloud...');
    execSync('npx prisma db push --schema=prisma/schema.prisma', {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: neonDbUrl },
    });

    // 3. Connect to Neon Cloud PostgreSQL using CloudPrismaClient (@prisma/client-cloud)
    const cloudPrisma = new CloudPrismaClient({
      datasources: { db: { url: neonDbUrl } },
    });

    console.log('🧹 Clearing existing data on Neon Cloud PostgreSQL...');
    await cloudPrisma.orderItem.deleteMany();
    await cloudPrisma.order.deleteMany();
    await cloudPrisma.product.deleteMany();
    await cloudPrisma.category.deleteMany();

    // 4. Upload Categories to Cloud PostgreSQL
    console.log('🚀 Uploading categories to Neon Cloud PostgreSQL...');
    for (const cat of categories) {
      await cloudPrisma.category.create({
        data: {
          id: cat.id,
          name: cat.name,
          createdAt: cat.createdAt,
        },
      });
    }

    // 5. Upload Products to Cloud PostgreSQL
    console.log('🚀 Uploading products to Neon Cloud PostgreSQL...');
    for (const prod of products) {
      await cloudPrisma.product.create({
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

    // 6. Upload Orders and OrderItems to Cloud PostgreSQL
    console.log('🚀 Uploading orders & items to Neon Cloud PostgreSQL...');
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
    console.log('🎉 Neon PostgreSQL Cloud is now 100% synced with Local XAMPP MySQL database!');
    await cloudPrisma.$disconnect();
  } catch (error) {
    console.error('❌ Error during synchronization:', error);
    process.exit(1);
  }
}

syncFromMySQLToNeon();
