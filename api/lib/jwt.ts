import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'pos-zalde-fallback-secret-2026-key';
const TOKEN_EXPIRY = '24h';

export interface AuthTokenPayload {
  id: string;
  username: string;
  role: 'ADMIN' | 'KASIR' | 'GUDANG';
  name: string;
}

export function signToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded as AuthTokenPayload;
  } catch (_err) {
    return null;
  }
}
