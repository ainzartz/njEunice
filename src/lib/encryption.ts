import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_STRING = process.env.ENCRYPTION_KEY || '';

if (!KEY_STRING) {
  // In development, we might not have it set initially, but throw to ensure safety.
  // Unless we are building or generating prisma client without running app code.
  // For safety, we should log warning.
}

// Convert base64 key back to buffer if needed, or use as is if 32 bytes.
// openssl rand -base64 32 gives ~44 chars. Buffer.from(key, 'base64') -> 32 bytes.
const getKey = () => Buffer.from(KEY_STRING, 'base64');

export function encrypt(text: string): string {
  if (!text) return text;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  // Format: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decrypt(text: string): string {
  if (!text) return text;
  const parts = text.split(':');
  if (parts.length !== 3) return text; // Not encrypted or invalid format

  const [ivHex, authTagHex, encryptedHex] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
