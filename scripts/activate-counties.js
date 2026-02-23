const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Setting target counties...');

  const targetCounties = ['Bergen', 'Hudson', 'Passaic'];

  const result = await prisma.county.updateMany({
    where: {
      name: {
        in: targetCounties
      }
    },
    data: {
      isTarget: true
    }
  });

  console.log(`Successfully updated ${result.count} counties to be active targets.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
