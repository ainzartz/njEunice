import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { email: { contains: 'ainzartz' } }
  });
  console.log(users.map(u => ({ id: u.id, email: u.email, isLogin: u.isLogin, isDeleted: u.isDeleted })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
