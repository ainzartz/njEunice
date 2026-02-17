import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'ainzartz@gmail.com';
  const daysAgo = 31;
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);

  await prisma.user.update({
    where: { email },
    data: { lastLoginAt: date },
  });

  console.log(`Updated ${email} lastLoginAt to ${date.toISOString()}`);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
