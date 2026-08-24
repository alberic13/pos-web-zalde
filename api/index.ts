import { PrismaClient } from '@prisma/client';
import http from 'http';

let globalPrisma: PrismaClient | undefined;

function getPrismaClient(): PrismaClient {
  if (!globalPrisma) {
    globalPrisma = new PrismaClient();
  }
  return globalPrisma;
}

export default async function handler(req: any, res: any) {
  const prisma = getPrismaClient();
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  const jsonResponse = (data: any, status = 200) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  };

  try {
    const rawUrl = req.url || '/';
    const parsedUrl = new URL(rawUrl, `http://${req.headers?.host || 'localhost'}`);
    const pathname = parsedUrl.pathname.replace(/\/$/, '') || '/';
    const method = (req.method || 'GET').toUpperCase();

    // Parse JSON body for POST/PUT
    let body: any = {};
    if (method === 'POST' || method === 'PUT') {
      if (req.body) {
        body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      } else {
        const buffers: Uint8Array[] = [];
        for await (const chunk of req) {
          buffers.push(chunk);
        }
        const dataStr = Buffer.concat(buffers).toString();
        if (dataStr) {
          try {
            body = JSON.parse(dataStr);
          } catch {
            body = {};
          }
        }
      }
    }

    // Health check
    if (pathname === '/api/health' || pathname === '/health') {
      return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() });
    }

    // Auth Endpoints
    if ((pathname === '/api/auth/login' || pathname === '/auth/login') && method === 'POST') {
      const { username, password, role } = body;

      // Allow 1-click login if role is directly supplied
      if (role && ['ADMIN', 'KASIR', 'GUDANG'].includes(role.toUpperCase())) {
        const selectedRole = role.toUpperCase();
        const nameMap: Record<string, string> = {
          ADMIN: 'Admin Zalde',
          KASIR: 'Kasir Toko Depan',
          GUDANG: 'Staff Gudang',
        };
        return jsonResponse({
          success: true,
          data: {
            user: {
              username: selectedRole.toLowerCase(),
              name: nameMap[selectedRole] || selectedRole,
              role: selectedRole,
            },
            token: `token-${selectedRole.toLowerCase()}-${Date.now()}`,
            permissions: selectedRole === 'ADMIN' ? ['*'] : selectedRole === 'KASIR' ? ['pos', 'products', 'orders', 'chat'] : ['inventory', 'categories', 'products', 'chat'],
          },
          message: `Login berhasil sebagai ${selectedRole}`,
        });
      }

      // Username / Password verification
      const cleanUser = (username || '').trim().toLowerCase();
      const cleanPass = (password || '').trim();

      if (!cleanUser || !cleanPass) {
        return jsonResponse({ success: false, error: 'Username dan password wajib diisi' }, 400);
      }

      let matchedRole: string | null = null;
      let displayName = '';

      if (cleanUser === 'admin' && cleanPass === 'admin123') {
        matchedRole = 'ADMIN';
        displayName = 'Admin Zalde';
      } else if (cleanUser === 'kasir' && cleanPass === 'kasir123') {
        matchedRole = 'KASIR';
        displayName = 'Kasir Toko Depan';
      } else if (cleanUser === 'gudang' && cleanPass === 'gudang123') {
        matchedRole = 'GUDANG';
        displayName = 'Staff Gudang';
      }

      if (!matchedRole) {
        return jsonResponse(
          {
            success: false,
            error: 'Username atau password System 7 tidak valid. (Kredensial Admin: admin / admin123)',
          },
          401
        );
      }

      return jsonResponse({
        success: true,
        data: {
          user: {
            username: cleanUser,
            name: displayName,
            role: matchedRole,
          },
          token: `token-${cleanUser}-${Date.now()}`,
          permissions: matchedRole === 'ADMIN' ? ['*'] : matchedRole === 'KASIR' ? ['pos', 'products', 'orders', 'chat'] : ['inventory', 'categories', 'products', 'chat'],
        },
        message: `Login berhasil sebagai ${matchedRole}`,
      });
    }

    // Dashboard Stats
    if (pathname === '/api/dashboard/stats') {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

      const [todayOrders, monthOrders, totalProducts, lowStockProducts] = await Promise.all([
        prisma.order.findMany({
          where: { createdAt: { gte: startOfDay } },
          include: { items: true },
        }),
        prisma.order.findMany({
          where: { createdAt: { gte: startOfMonth } },
          include: { items: true },
        }),
        prisma.product.count(),
        prisma.product.findMany({
          where: { stock: { lte: 5 } },
          include: { category: true },
          take: 5,
        }),
      ]);

      const todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      const monthRevenue = monthOrders.reduce((sum, o) => sum + o.totalAmount, 0);

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const last7DaysOrders = await prisma.order.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        orderBy: { createdAt: 'asc' },
      });

      const salesMap: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        salesMap[key] = 0;
      }

      last7DaysOrders.forEach((o) => {
        const key = new Date(o.createdAt).toISOString().split('T')[0];
        if (salesMap[key] !== undefined) {
          salesMap[key] += o.totalAmount;
        }
      });

      const salesChart = Object.entries(salesMap).map(([date, total]) => ({
        date: new Date(date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }),
        total,
        revenue: total,
      }));

      const topItems = await prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      });

      const topProductsDetailed = await Promise.all(
        topItems.map(async (item) => {
          const prod = await prisma.product.findUnique({
            where: { id: item.productId },
            include: { category: true },
          });
          return {
            id: item.productId,
            name: prod?.name || 'Produk',
            category: prod?.category?.name || 'Elektronik',
            imageUrl: prod?.imageUrl || null,
            soldCount: item._sum.quantity || 0,
            revenue: (prod?.price || 0) * (item._sum.quantity || 0),
          };
        })
      );

      return jsonResponse({
        success: true,
        data: {
          todayRevenue,
          todayOrdersCount: todayOrders.length,
          monthRevenue,
          monthOrdersCount: monthOrders.length,
          totalProducts,
          totalProductsCount: totalProducts,
          lowStockCount: lowStockProducts.length,
          salesChart,
          topProducts: topProductsDetailed,
          lowStockProducts,
          recentOrders: todayOrders.slice(0, 5),
        },
      });
    }

    // Categories Endpoints
    if (pathname === '/api/categories') {
      if (method === 'GET') {
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
        return jsonResponse({ success: true, data: formatted });
      }
      if (method === 'POST') {
        const { name } = body;
        if (!name) return jsonResponse({ success: false, error: 'Category name is required' }, 400);
        const category = await prisma.category.create({ data: { name: name.trim() } });
        return jsonResponse({ success: true, data: category });
      }
    }

    const categoryIdMatch = pathname.match(/^\/api\/categories\/([^/]+)$/);
    if (categoryIdMatch) {
      const id = categoryIdMatch[1];
      if (method === 'PUT') {
        const { name } = body;
        if (!name) return jsonResponse({ success: false, error: 'Category name is required' }, 400);
        const category = await prisma.category.update({
          where: { id },
          data: { name: name.trim() },
        });
        return jsonResponse({ success: true, data: category });
      }
      if (method === 'DELETE') {
        await prisma.category.delete({ where: { id } });
        return jsonResponse({ success: true, message: 'Category deleted successfully' });
      }
    }

    // Products Endpoints
    if (pathname === '/api/products') {
      if (method === 'GET') {
        const search = parsedUrl.searchParams.get('search') || undefined;
        const categoryId = parsedUrl.searchParams.get('categoryId') || undefined;

        const where: any = {};

        // Category filter (only apply if specified and not 'all')
        if (categoryId && categoryId !== 'all') {
          where.categoryId = categoryId;
        }

        // Case-insensitive multi-word search across name, sku, and category
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
        return jsonResponse({ success: true, data: products });
      }
      // Handle web api product add or create
      if (method === 'POST') {
        const { sku, name, price, costPrice, stock, warehouseStock, categoryId, imageUrl } = body;
        if (!name || price === undefined || stock === undefined || !categoryId) {
          return jsonResponse({ success: false, error: 'Missing required fields' }, 400);
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
        return jsonResponse({ success: true, data: product });
      }
    }

    // Endpoint for stock transfer from Gudang to Etalase Kasir
    const transferMatch = pathname.match(/^\/api\/products\/([^/]+)\/transfer-to-display$/);
    if (transferMatch && method === 'POST') {
      const id = transferMatch[1];
      const { amount } = body;
      const transferQty = Number(amount);

      if (isNaN(transferQty) || transferQty <= 0) {
        return jsonResponse({ success: false, error: 'Jumlah transfer harus berupa angka positif' }, 400);
      }

      const product = await prisma.product.findUnique({ where: { id } });
      if (!product) {
        return jsonResponse({ success: false, error: 'Produk tidak ditemukan' }, 404);
      }

      if (product.warehouseStock < transferQty) {
        return jsonResponse(
          {
            success: false,
            error: `Stok gudang tidak mencukupi. Sisa stok gudang: ${product.warehouseStock} unit.`,
          },
          400
        );
      }

      const updated = await prisma.product.update({
        where: { id },
        data: {
          warehouseStock: { decrement: transferQty },
          stock: { increment: transferQty },
        },
        include: { category: true },
      });

      return jsonResponse({
        success: true,
        message: `Berhasil memindahkan ${transferQty} unit dari Gudang ke Etalase Kasir.`,
        data: updated,
      });
    }

    const productIdMatch = pathname.match(/^\/api\/products\/([^/]+)$/);
    if (productIdMatch) {
      const id = productIdMatch[1];
      if (method === 'GET') {
        const product = await prisma.product.findUnique({
          where: { id },
          include: { category: true },
        });
        if (!product) return jsonResponse({ success: false, error: 'Product not found' }, 404);
        return jsonResponse({ success: true, data: product });
      }
      if (method === 'PUT') {
        const { sku, name, price, costPrice, stock, warehouseStock, categoryId, imageUrl } = body;
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
        return jsonResponse({ success: true, data: product });
      }
      if (method === 'DELETE') {
        await prisma.product.delete({ where: { id } });
        return jsonResponse({ success: true, message: 'Product deleted successfully' });
      }
    }

    // Orders Endpoints
    if (pathname === '/api/orders') {
      if (method === 'GET') {
        const orders = await prisma.order.findMany({
          include: { items: { include: { product: true } } },
          orderBy: { createdAt: 'desc' },
        });
        return jsonResponse({ success: true, data: orders });
      }

      if (method === 'POST') {
        const { items, paymentMethod, paymentAmount } = body;
        if (!items || !Array.isArray(items) || items.length === 0) {
          return jsonResponse({ success: false, error: 'Cart items required' }, 400);
        }

        const result = await prisma.$transaction(async (tx) => {
          const orderItemsToCreate = await Promise.all(
            items.map(async (item: any) => {
              let itemPrice = Number(item.price ?? item.unitPrice);
              if (isNaN(itemPrice) || itemPrice <= 0) {
                const prod = await tx.product.findUnique({ where: { id: item.productId } });
                itemPrice = prod?.price || 0;
              }
              return {
                productId: item.productId,
                quantity: Number(item.quantity || 1),
                price: itemPrice,
              };
            })
          );

          const totalAmount = orderItemsToCreate.reduce((sum, i) => sum + i.price * i.quantity, 0);
          const changeAmount = (paymentAmount || totalAmount) - totalAmount;
          const orderNumber = `ORD-${Date.now()}`;

          const createdOrder = await tx.order.create({
            data: {
              orderNumber,
              totalAmount,
              paymentAmount: paymentAmount || totalAmount,
              changeAmount: Math.max(0, changeAmount),
              paymentMethod: paymentMethod || 'CASH',
              items: { create: orderItemsToCreate },
            },
            include: { items: { include: { product: true } } },
          });

          for (const item of items) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.quantity } },
            });
          }
          return createdOrder;
        });

        return jsonResponse({ success: true, data: result, message: 'Transaksi berhasil diselesaikan' });
      }
    }

    // SUPPLIER ENDPOINTS
    if (pathname === '/api/suppliers') {
      if (method === 'GET') {
        let suppliers = await prisma.supplier.findMany({
          orderBy: { createdAt: 'desc' },
        });

        // Auto-seed default suppliers if empty
        if (suppliers.length === 0) {
          await prisma.supplier.createMany({
            data: [
              {
                companyName: 'PT Fantech Indonesia Distribution',
                contactPerson: 'Bpk. Hendra Setyawan',
                phone: '081234567890',
                whatsapp: '6281234567890',
                email: 'sales@fantech.co.id',
                address: 'Kawasan Industri Mangga Dua Plaza Blok A No. 12, Jakarta Pusat',
                categorySupply: 'Komponen & Aksesoris PC',
                notes: 'Minimal order 10 unit per SKU. Diskon 5% untuk pembelian > Rp 5.000.000',
              },
              {
                companyName: 'CV SteelSeries Jaya Tech',
                contactPerson: 'Ibu Rina Wijaya',
                phone: '081987654321',
                whatsapp: '6281987654321',
                email: 'orders@steelseries-distro.id',
                address: 'Ruko Dusit Mangga Dua No. 45, Jakarta Pusat',
                categorySupply: 'Komponen & Aksesoris PC',
                notes: 'Pengiriman H+1 setelah pembayaran (Transfer BCA).',
              },
              {
                companyName: 'Distributor Anker & Powerbank Official',
                contactPerson: 'Bpk. Andi Kurniawan',
                phone: '085711223344',
                whatsapp: '6285711223344',
                email: 'supply@ankertech.co.id',
                address: 'Kawasan Harco Mangga Dua lantai 3 Blok B No. 88, Jakarta Pusat',
                categorySupply: 'Charger & Power',
                notes: 'Garansi resmi 18 bulan per unit.',
              },
              {
                companyName: 'Maju Bersama Gadget Accessories',
                contactPerson: 'Ibu Maya Lestari',
                phone: '082199887766',
                whatsapp: '6282199887766',
                email: 'sales@majubersama-gadget.com',
                address: 'ITC Roxy Mas lantai 2 No. 102, Jakarta Barat',
                categorySupply: 'Aksesoris HP',
                notes: 'Spesialis Tempered Glass Privacy & Case MagSafe iPhone / Android.',
              },
              {
                companyName: 'PT Audio Indonesia Jaya',
                contactPerson: 'Bpk. Budi Santoso',
                phone: '081399887711',
                whatsapp: '6281399887711',
                email: 'contact@audio-indonesia.co.id',
                address: 'Kawasan Central Park Mal Lt. 3, Jakarta Barat',
                categorySupply: 'Audio & Gaming',
                notes: 'Distributor Headset & Speaker Gaming.',
              },
            ],
          });
          suppliers = await prisma.supplier.findMany({
            orderBy: { createdAt: 'desc' },
          });
        }

        return jsonResponse({ success: true, data: suppliers });
      }

      if (method === 'POST') {
        const { companyName, contactPerson, phone, whatsapp, email, address, categorySupply, notes } = body;

        if (!companyName || !contactPerson || !phone || !whatsapp || !categorySupply) {
          return jsonResponse({ success: false, error: 'Mandatory fields missing' }, 400);
        }

        const newSupplier = await prisma.supplier.create({
          data: {
            companyName,
            contactPerson,
            phone,
            whatsapp,
            email: email || null,
            address: address || null,
            categorySupply,
            notes: notes || null,
          },
        });

        return jsonResponse({ success: true, data: newSupplier, message: 'Supplier berhasil ditambahkan' }, 201);
      }
    }

    const supplierIdMatch = pathname.match(/^\/api\/suppliers\/([^/]+)$/);
    if (supplierIdMatch) {
      const id = supplierIdMatch[1];
      if (method === 'PUT') {
        const { companyName, contactPerson, phone, whatsapp, email, address, categorySupply, notes } = body;

        const updatedSupplier = await prisma.supplier.update({
          where: { id },
          data: {
            companyName,
            contactPerson,
            phone,
            whatsapp,
            email: email || null,
            address: address || null,
            categorySupply,
            notes: notes || null,
          },
        });

        return jsonResponse({ success: true, data: updatedSupplier, message: 'Supplier berhasil diperbarui' });
      }

      if (method === 'DELETE') {
        await prisma.supplier.delete({ where: { id } });
        return jsonResponse({ success: true, message: 'Supplier berhasil dihapus' });
      }
    }

    // CHAT MESSAGES ENDPOINTS
    if (pathname === '/api/chat/messages') {
      if (method === 'GET') {
        let messages = await prisma.chatMessage.findMany({
          orderBy: { createdAt: 'asc' },
          take: 100,
        });

        // Auto-seed starter messages if empty
        if (messages.length === 0) {
          await prisma.chatMessage.createMany({
            data: [
              {
                senderRole: 'KASIR',
                senderName: 'Kasir Toko Depan',
                message: 'Halo Tim Gudang, tolong restok Tempered Glass Privacy iPhone 15 ke etalase ya 🙏',
                isQuickMsg: true,
              },
              {
                senderRole: 'GUDANG',
                senderName: 'Staff Gudang',
                message: 'Siap Kasir! Stok 10 unit Tempered Glass Privacy sedang disiapkan ke etalase.',
                isQuickMsg: true,
              },
              {
                senderRole: 'ADMIN',
                senderName: 'Admin Zalde',
                message: 'Sistem Chat Internal Toko Depan & Gudang Aktif. Selamat bertugas!',
                isQuickMsg: false,
              },
            ],
          });
          messages = await prisma.chatMessage.findMany({
            orderBy: { createdAt: 'asc' },
            take: 100,
          });
        }

        return jsonResponse({ success: true, data: messages });
      }

      if (method === 'POST') {
        const { senderRole, senderName, message, isQuickMsg } = body;

        if (!message || typeof message !== 'string' || message.trim() === '') {
          return jsonResponse({ success: false, error: 'Pesan tidak boleh kosong' }, 400);
        }

        const validRoles = ['KASIR', 'GUDANG', 'ADMIN'];
        const role = validRoles.includes(senderRole?.toUpperCase()) ? senderRole.toUpperCase() : 'KASIR';
        const name = senderName && senderName.trim() !== '' ? senderName.trim() : (role === 'KASIR' ? 'Penjaga Toko' : role === 'GUDANG' ? 'Staff Gudang' : 'Admin Toko');

        const newMessage = await prisma.chatMessage.create({
          data: {
            senderRole: role,
            senderName: name,
            message: message.trim(),
            isQuickMsg: Boolean(isQuickMsg),
          },
        });

        return jsonResponse({ success: true, data: newMessage, message: 'Pesan berhasil terkirim' }, 201);
      }

      if (method === 'DELETE') {
        await prisma.chatMessage.deleteMany();
        return jsonResponse({ success: true, message: 'Riwayat percakapan berhasil dibersihkan' });
      }
    }

    return jsonResponse({ success: false, error: `Endpoint '${pathname}' not found` }, 404);
  } catch (error: any) {
    console.error('API Error:', error);
    return jsonResponse({ success: false, error: error.message || 'Internal Server Error' }, 500);
  }
}

// Local Development Server Listener (Runs on http://localhost:3000 when executed locally)
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  const server = http.createServer((req: any, res: any) => {
    handler(req, res);
  });
  server.listen(PORT, () => {
    console.log(`🚀 POS Local API Server running at http://localhost:${PORT}`);
  });
}
