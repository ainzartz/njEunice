
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
require('dotenv').config(); // Load env vars

const prisma = new PrismaClient();

const ALGORITHM = 'aes-256-gcm';
const KEY_STRING = process.env.ENCRYPTION_KEY;

if (!KEY_STRING) {
  console.error('ENCRYPTION_KEY missing in environment variables');
  process.exit(1);
}

const getKey = () => Buffer.from(KEY_STRING, 'base64');

function encrypt(text) {
  if (!text) return text;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

async function main() {
  const email = 'admin@test.com';
  const password = 'Djemals10*';
  const hashedPassword = await bcrypt.hash(password, 10);

  const firstNameEncrypted = encrypt('Admin');
  const lastNameEncrypted = encrypt('User');
  const phoneEncrypted = encrypt('555-555-5555');
  const addressEncrypted = encrypt('123 Admin St, Admin City, NJ 00000');
  const dobEncrypted = encrypt('1980-01-01');

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash: hashedPassword,
      lastPasswordChangeAt: new Date(),
      firstNameEncrypted,
      lastNameEncrypted,
      phoneEncrypted,
      addressEncrypted,
      dobEncrypted
    },
    create: {
      email,
      passwordHash: hashedPassword,
      firstNameEncrypted,
      lastNameEncrypted,
      phoneEncrypted,
      addressEncrypted,
      dobEncrypted,
      isAdmin: true,
      lastPasswordChangeAt: new Date(),
    },
  });

  console.log({ user });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
