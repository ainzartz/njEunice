
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@test.com';

  const token = crypto.randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + 3600000); // 1 hour

  const user = await prisma.user.update({
    where: { email },
    data: {
      resetToken: token,
      resetTokenExpiry: expiry,
    },
  });

  console.log(`Token: ${token}`);
  console.log(`Link: http://localhost:3000/auth/reset-password?token=${token}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
