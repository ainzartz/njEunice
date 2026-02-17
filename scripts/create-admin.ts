import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Encryption Logic (copied from src/lib/encryption.ts)
const ALGORITHM = 'aes-256-gcm';
const KEY_STRING = process.env.ENCRYPTION_KEY || '';
const getKey = () => Buffer.from(KEY_STRING, 'base64');

function encrypt(text: string): string {
  if (!text) return text;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

// Hashing Logic (copied from src/lib/auth.ts)
async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function main() {
  const email = 'ainzartz@gmail.com';
  const rawPassword = 'Djemals10*';
  const rawName = 'dong kyu Lee';
  const rawAddress = '121 newcomb rd Tenafly NJ';
  const rawDob = '';
  const rawPhone = '';

  console.log(`Creating admin user: ${email}`);

  if (!KEY_STRING) {
    console.error("ENCRYPTION_KEY required in environment");
    process.exit(1);
  }

  // 1. Hash Password
  console.log('Hashing password...');
  const passwordHash = await hashPassword(rawPassword);

  // 2. Encrypt Fields
  console.log('Encrypting fields...');
  const nameEncrypted = encrypt(rawName);
  const addressEncrypted = encrypt(rawAddress);
  const dobEncrypted = encrypt(rawDob);
  const phoneEncrypted = encrypt(rawPhone);

  // 3. Create User
  console.log('Upserting user...');
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      nameEncrypted,
      addressEncrypted,
      dobEncrypted,
      phoneEncrypted,
      isAdmin: true,
    },
    create: {
      email,
      passwordHash,
      nameEncrypted,
      addressEncrypted,
      dobEncrypted,
      phoneEncrypted,
      isAdmin: true,
      autoEmail: false,
      autoSms: false,
    },
  });

  console.log('User created/updated:', user.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
