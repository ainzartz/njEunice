import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET;

if (!SECRET_KEY) {
  throw new Error('JWT_SECRET environment variable is required');
}

export function signToken(payload: object): string {
  return jwt.sign(payload, SECRET_KEY!, { expiresIn: '1d' });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, SECRET_KEY!);
  } catch (error) {
    return null;
  }
}
