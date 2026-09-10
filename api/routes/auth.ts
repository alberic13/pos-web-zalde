import { Elysia } from 'elysia';

function handleLogin({ body, set }: { body: any; set: any }) {
  const { username, password, role } = (body || {}) as {
    username?: string;
    password?: string;
    role?: string;
  };

  // 1-click role login
  if (role && ['ADMIN', 'KASIR', 'GUDANG'].includes(role.toUpperCase())) {
    const selectedRole = role.toUpperCase();
    const nameMap: Record<string, string> = {
      ADMIN: 'Admin Zalde',
      KASIR: 'Kasir Toko Depan',
      GUDANG: 'Staff Gudang',
    };
    return {
      success: true,
      data: {
        user: {
          username: selectedRole.toLowerCase(),
          name: nameMap[selectedRole] || selectedRole,
          role: selectedRole,
        },
        token: `token-${selectedRole.toLowerCase()}-${Date.now()}`,
        permissions:
          selectedRole === 'ADMIN'
            ? ['*']
            : selectedRole === 'KASIR'
              ? ['pos', 'products', 'orders', 'chat']
              : ['inventory', 'categories', 'products', 'chat'],
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
    set.status = 401;
    return {
      success: false,
      error: 'Username atau password System 7 tidak valid. (Kredensial Admin: admin / admin123)',
    };
  }

  return {
    success: true,
    data: {
      user: {
        username: cleanUser,
        name: displayName,
        role: matchedRole,
      },
      token: `token-${cleanUser}-${Date.now()}`,
      permissions:
        matchedRole === 'ADMIN'
          ? ['*']
          : matchedRole === 'KASIR'
            ? ['pos', 'products', 'orders', 'chat']
            : ['inventory', 'categories', 'products', 'chat'],
    },
    message: `Login berhasil sebagai ${matchedRole}`,
  };
}

export const authRoutes = new Elysia()
  .post('/api/auth/login', handleLogin)
  .post('/auth/login', handleLogin);
