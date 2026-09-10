import { Elysia } from 'elysia';
import { prisma } from '../db';

const defaultSuppliers = [
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
];

export const supplierRoutes = new Elysia({ prefix: '/api/suppliers' })
  .get('/', async () => {
    let suppliers = await prisma.supplier.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (suppliers.length === 0) {
      await prisma.supplier.createMany({ data: defaultSuppliers });
      suppliers = await prisma.supplier.findMany({
        orderBy: { createdAt: 'desc' },
      });
    }

    return { success: true, data: suppliers };
  })
  .post('/', async ({ body, set }: { body: any; set: any }) => {
    const { companyName, contactPerson, phone, whatsapp, email, address, categorySupply, notes } = body || {};

    if (!companyName || !contactPerson || !phone || !whatsapp || !categorySupply) {
      set.status = 400;
      return { success: false, error: 'Mandatory fields missing' };
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

    set.status = 201;
    return { success: true, data: newSupplier, message: 'Supplier berhasil ditambahkan' };
  })
  .put('/:id', async ({ params: { id }, body }: { params: { id: string }; body: any }) => {
    const { companyName, contactPerson, phone, whatsapp, email, address, categorySupply, notes } = body || {};

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

    return { success: true, data: updatedSupplier, message: 'Supplier berhasil diperbarui' };
  })
  .delete('/:id', async ({ params: { id } }: { params: { id: string } }) => {
    await prisma.supplier.delete({ where: { id } });
    return { success: true, message: 'Supplier berhasil dihapus' };
  });
