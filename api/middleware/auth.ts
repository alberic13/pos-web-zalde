import { verifyToken, AuthTokenPayload } from '../lib/jwt';

export function authenticate(headers: Record<string, string | undefined>): {
  user: AuthTokenPayload | null;
  error?: string;
} {
  const authHeader = headers['authorization'] || headers['Authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      user: null,
      error: 'Akses ditolak: Token autentikasi tidak ditemukan. Silakan login terlebih dahulu.',
    };
  }

  const token = authHeader.slice(7).trim();
  const user = verifyToken(token);

  if (!user) {
    return {
      user: null,
      error: 'Akses ditolak: Token tidak valid atau sesi telah kadaluarsa.',
    };
  }

  return { user };
}

export function requireAuth({ headers, set }: { headers: Record<string, string | undefined>; set: any }) {
  const auth = authenticate(headers);
  if (!auth.user) {
    set.status = 401;
    return { success: false, error: auth.error };
  }
}

export function requireRole(allowedRoles: ('ADMIN' | 'KASIR' | 'GUDANG')[]) {
  return ({ headers, set }: { headers: Record<string, string | undefined>; set: any }) => {
    const auth = authenticate(headers);
    if (!auth.user) {
      set.status = 401;
      return { success: false, error: auth.error };
    }
    if (!allowedRoles.includes(auth.user.role)) {
      set.status = 403;
      return {
        success: false,
        error: `Akses terlarang: Fitur ini hanya dapat diakses oleh role [${allowedRoles.join(', ')}].`,
      };
    }
  };
}
