import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.ENCRYPTION_KEY || 'unsafe-secret-key-change-me';

export function signToken(payload: object): string {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: '1d' });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    return null;
  }
}
