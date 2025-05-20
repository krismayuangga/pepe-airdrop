import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'pepe_secret_key';

export interface AdminJwtPayload {
  role: 'admin';
  username: string;
}

export function signAdminJwt(payload: AdminJwtPayload, expiresIn = '2h') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

export function verifyAdminJwt(token: string): AdminJwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminJwtPayload;
    if (decoded.role === 'admin') return decoded;
    return null;
  } catch {
    return null;
  }
}
