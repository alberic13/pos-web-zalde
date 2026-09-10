import { Elysia } from 'elysia';
import { prisma } from '../db';

const defaultChatMessages = [
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
];

export const chatRoutes = new Elysia({ prefix: '/api/chat/messages' })
  .get('/', async () => {
    let messages = await prisma.chatMessage.findMany({
      orderBy: { createdAt: 'asc' },
      take: 100,
    });

    if (messages.length === 0) {
      await prisma.chatMessage.createMany({ data: defaultChatMessages });
      messages = await prisma.chatMessage.findMany({
        orderBy: { createdAt: 'asc' },
        take: 100,
      });
    }

    return { success: true, data: messages };
  })
  .post('/', async ({ body, set }: { body: any; set: any }) => {
    const { senderRole, senderName, message, isQuickMsg } = body || {};

    if (!message || typeof message !== 'string' || message.trim() === '') {
      set.status = 400;
      return { success: false, error: 'Pesan tidak boleh kosong' };
    }

    const validRoles = ['KASIR', 'GUDANG', 'ADMIN'];
    const role = validRoles.includes(senderRole?.toUpperCase())
      ? senderRole.toUpperCase()
      : 'KASIR';
    const name =
      senderName && senderName.trim() !== ''
        ? senderName.trim()
        : role === 'KASIR'
          ? 'Penjaga Toko'
          : role === 'GUDANG'
            ? 'Staff Gudang'
            : 'Admin Toko';

    const newMessage = await prisma.chatMessage.create({
      data: {
        senderRole: role,
        senderName: name,
        message: message.trim(),
        isQuickMsg: Boolean(isQuickMsg),
      },
    });

    set.status = 201;
    return {
      success: true,
      data: newMessage,
      message: 'Pesan berhasil terkirim',
    };
  })
  .delete('/', async () => {
    await prisma.chatMessage.deleteMany();
    return { success: true, message: 'Riwayat percakapan berhasil dibersihkan' };
  });
