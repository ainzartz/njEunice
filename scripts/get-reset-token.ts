import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'ainzartz@gmail.com';
  const user = await prisma.user.findUnique({ where: { email } });
  console.log(`ResetToken: ${user?.resetToken}`);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
