import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting electronic & tech accessories database seed...');

  // Clean database
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // Create Electronics & Accessories Categories
  const catHpAcc = await prisma.category.create({ data: { name: 'Aksesoris HP' } });
  const catAudio = await prisma.category.create({ data: { name: 'Audio & Gaming' } });
  const catPcAcc = await prisma.category.create({ data: { name: 'Komponen & Aksesoris PC' } });
  const catCharger = await prisma.category.create({ data: { name: 'Charger & Power' } });

  console.log('✅ Created electronic categories');

  // Create Electronics & Gadgets Products
  const productsData = [
    {
      sku: 'ELC-001',
      name: 'Kabel Data Fast Charging Type-C 100W 1.5m',
      price: 45000,
      costPrice: 22000,
      stock: 45,
      categoryId: catCharger.id,
      imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=400&q=80',
    },
    {
      sku: 'ELC-002',
      name: 'Charger GaN 65W Dual Port Fast Charge',
      price: 220000,
      costPrice: 120000,
      stock: 25,
      categoryId: catCharger.id,
      imageUrl: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=400&q=80',
    },
    {
      sku: 'ELC-003',
      name: 'Powerbank 20000mAh 22.5W Quick Charge',
      price: 275000,
      costPrice: 150000,
      stock: 4, // Low stock!
      categoryId: catCharger.id,
      imageUrl: '/products/powerbank.jpg',
    },
    {
      sku: 'ELC-004',
      name: 'Earphones Bluetooth TWS Noise Cancelling',
      price: 245000,
      costPrice: 130000,
      stock: 30,
      categoryId: catAudio.id,
      imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80',
    },
    {
      sku: 'ELC-005',
      name: 'Headset Gaming RGB Surround 7.1',
      price: 385000,
      costPrice: 210000,
      stock: 12,
      categoryId: catAudio.id,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80',
    },
    {
      sku: 'ELC-006',
      name: 'Speaker Bluetooth Portable Waterproof IPX7',
      price: 320000,
      costPrice: 180000,
      stock: 3, // Low stock!
      categoryId: catAudio.id,
      imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=400&q=80',
    },
    {
      sku: 'ELC-007',
      name: 'Keyboard Mekanikal RGB Blue Switch 87 Keys',
      price: 450000,
      costPrice: 260000,
      stock: 18,
      categoryId: catPcAcc.id,
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=400&q=80',
    },
    {
      sku: 'ELC-008',
      name: 'Mouse Gaming Wireless Optical 16000 DPI',
      price: 195000,
      costPrice: 95000,
      stock: 40,
      categoryId: catPcAcc.id,
      imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=400&q=80',
    },
    {
      sku: 'ELC-009',
      name: 'Case MagSafe Matte iPhone 15 Pro Max',
      price: 95000,
      costPrice: 40000,
      stock: 50,
      categoryId: catHpAcc.id,
      imageUrl: 'https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&w=400&q=80',
    },
    {
      sku: 'ELC-010',
      name: 'Tempered Glass Curved Privacy Protection 9H',
      price: 65000,
      costPrice: 25000,
      stock: 60,
      categoryId: catHpAcc.id,
      imageUrl: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=400&q=80',
    },
  ];

  const createdProducts = [];
  for (const p of productsData) {
    const prod = await prisma.product.create({ data: p });
    createdProducts.push(prod);
  }
  console.log(`✅ Created ${createdProducts.length} electronic products`);

  // Create Sample Past Orders for Electronics POS Analytics Dashboard
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const orderDate = new Date(now);
    orderDate.setDate(now.getDate() - i);

    const numOrdersToday = Math.floor(Math.random() * 4) + 2;

    for (let j = 0; j < numOrdersToday; j++) {
      const p1 = createdProducts[Math.floor(Math.random() * createdProducts.length)];
      const p2 = createdProducts[Math.floor(Math.random() * createdProducts.length)];
      const q1 = Math.floor(Math.random() * 2) + 1;
      const q2 = Math.floor(Math.random() * 2) + 1;

      const total = (p1.price * q1) + (p2.price * q2);
      const paid = Math.ceil(total / 50000) * 50000;

      await prisma.order.create({
        data: {
          orderNumber: `ORD-${Date.now()}-${i}${j}`,
          totalAmount: total,
          paymentAmount: paid,
          changeAmount: paid - total,
          paymentMethod: j % 2 === 0 ? 'CASH' : 'QRIS',
          createdAt: orderDate,
          items: {
            create: [
              { productId: p1.id, quantity: q1, price: p1.price },
              { productId: p2.id, quantity: q2, price: p2.price },
            ],
          },
        },
      });
    }
  }

  console.log('✅ Created sample electronics transactions for analytics dashboard');
  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
