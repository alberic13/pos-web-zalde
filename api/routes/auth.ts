import { Elysia } from 'elysia';
import bcrypt from 'bcryptjs';
import { prisma } from '../db';
import { signToken, verifyToken, AuthTokenPayload } from '../lib/jwt';

const ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: ['*'],
  KASIR: ['pos', 'products', 'orders', 'chat'],
  GUDANG: ['inventory', 'categories', 'products', 'chat'],
};

async function handleLogin({ body, set }: { body: any; set: any }) {
  const { username, password, role } = (body || {}) as {
    username?: string;
    password?: string;
    role?: string;
  };

  // 1-click showcase demo login
  if (role && ['ADMIN', 'KASIR', 'GUDANG'].includes(role.toUpperCase())) {
    const selectedRole = role.toUpperCase() as 'ADMIN' | 'KASIR' | 'GUDANG';
    let user = null;

    try {
      user = await prisma.user.findFirst({ where: { role: selectedRole } });
    } catch (_err) {
      // Graceful fallback if database connection has temporary issue
    }

    const userData: AuthTokenPayload = {
      id: user?.id || `demo-${selectedRole.toLowerCase()}`,
      username: user?.username || selectedRole.toLowerCase(),
      name: user?.name || (selectedRole === 'ADMIN' ? 'Admin Zalde' : selectedRole === 'KASIR' ? 'Kasir Toko Depan' : 'Staff Gudang'),
      role: selectedRole,
    };

    const token = signToken(userData);

    return {
      success: true,
      data: {
        user: userData,
        token,
        permissions: ROLE_PERMISSIONS[selectedRole] || ['pos'],
      },
      message: `Login berhasil sebagai ${selectedRole}`,
    };
  }

  const cleanUser = (username || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  if (!cleanUser || !cleanPass) {
    set.status = 400;
    return { success: false, error: 'Username dan password wajib diisi' };
  }

  try {
    const dbUser = await prisma.user.findUnique({ where: { username: cleanUser } });

    if (!dbUser) {
      set.status = 401;
      return { success: false, error: 'Username atau password tidak valid.' };
    }

    const isMatch = await bcrypt.compare(cleanPass, dbUser.passwordHash);
    if (!isMatch) {
      set.status = 401;
      return { success: false, error: 'Username atau password tidak valid.' };
    }

    const userPayload: AuthTokenPayload = {
      id: dbUser.id,
      username: dbUser.username,
      name: dbUser.name,
      role: dbUser.role as 'ADMIN' | 'KASIR' | 'GUDANG',
    };

    const token = signToken(userPayload);

    return {
      success: true,
      data: {
        user: userPayload,
        token,
        permissions: ROLE_PERMISSIONS[userPayload.role] || ['pos'],
      },
      message: `Login berhasil sebagai ${userPayload.role}`,
    };
  } catch (_err: any) {
    set.status = 500;
    return { success: false, error: 'Terjadi kesalahan server saat proses login.' };
  }
}

async function handleGetMe({ headers, set }: { headers: Record<string, string | undefined>; set: any }) {
  const authHeader = headers['authorization'] || headers['Authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    set.status = 401;
    return { success: false, error: 'Token tidak disertakan atau format tidak valid' };
  }

  const token = authHeader.slice(7).trim();
  const payload = verifyToken(token);

  if (!payload) {
    set.status = 401;
    return { success: false, error: 'Token telah kadaluarsa atau tidak valid' };
  }

  return {
    success: true,
    data: {
      user: payload,
      permissions: ROLE_PERMISSIONS[payload.role] || ['pos'],
    },
  };
}

export const authRoutes = new Elysia()
  .post('/api/auth/login', handleLogin)
  .post('/auth/login', handleLogin)
  .get('/api/auth/me', handleGetMe)
  .get('/auth/me', handleGetMe);
