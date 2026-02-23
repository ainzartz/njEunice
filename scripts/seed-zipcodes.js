const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Counties and ZipCodes...');

  const bergen = await prisma.county.create({
    data: { name: 'Bergen', state: 'NJ' }
  });

  const hudson = await prisma.county.create({
    data: { name: 'Hudson', state: 'NJ' }
  });

  const passaic = await prisma.county.create({
    data: { name: 'Passaic', state: 'NJ' }
  });

  await prisma.zipCode.createMany({
    data: [
      { code: '07601', cityName: 'Hackensack', countyId: bergen.id },
      { code: '07024', cityName: 'Fort Lee', countyId: bergen.id },
      { code: '07010', cityName: 'Cliffside Park', countyId: bergen.id },
      { code: '07020', cityName: 'Edgewater', countyId: bergen.id },

      { code: '07030', cityName: 'Hoboken', countyId: hudson.id },
      { code: '07302', cityName: 'Jersey City', countyId: hudson.id },
      { code: '07087', cityName: 'Union City', countyId: hudson.id },

      { code: '07501', cityName: 'Paterson', countyId: passaic.id },
      { code: '07011', cityName: 'Clifton', countyId: passaic.id },
      { code: '07470', cityName: 'Wayne', countyId: passaic.id },
    ]
  });

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
