const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// In lib/encryption.ts, it uses AES-256-GCM but we can leave it blank initially for admin setup
// or just use basic empty strings if allowed by the DB schema
const crypto = require('crypto');

function encrypt(text) {
  if (!text) return '';
  const algorithm = 'aes-256-gcm';
  // Attempting to replicate encryption just enough to satisfy DB if NOT NULL,
  // but let's try just plain strings first since the DB fields are just Strings.
  // Actually, wait, let's just insert empty strings for encrypted fields for the raw seed.
  // Admin password doesn't need encrypted name to login.
  return text;
}

async function main() {
  console.log('Seeding admin user...');

  const password = "password"; // Default temporary password
  const passwordHash = await bcrypt.hash(password, 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash: passwordHash,
      firstNameEncrypted: 'Admin',
      lastNameEncrypted: 'User',
      nameEncrypted: 'Admin User',
      phoneEncrypted: '',
      addressEncrypted: '',
      dobEncrypted: '',
      isAdmin: true,
      autoEmail: true,
      autoSms: true,
    },
  });

  await prisma.passwordHistory.create({
    data: {
      userId: adminUser.id,
      passwordHash: passwordHash
    }
  });

  console.log('Admin user seeded:', adminUser.email, 'with password:', password);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
