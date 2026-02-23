import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  const count = await prisma.user.count();
  console.log('Total users in DB:', count);

  const admin = await prisma.user.findFirst({
    where: { isAdmin: true }
  });
  console.log('Admin user exists?', !!admin);

  await prisma.$disconnect();
}

main().catch(console.error);
