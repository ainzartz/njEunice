const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const dotenv = require('dotenv');
dotenv.config();

async function check() {
  try {
    const count = await prisma.marketInsight.count();
    console.log(`MarketInsight count: ${count}`);

    if (count > 0) {
      const latest = await prisma.marketInsight.findFirst({ orderBy: { createdAt: 'desc' } });
      console.log(`Latest insight date: ${latest.createdAt}`);
      console.log(`Latest insight ID: ${latest.id}`);
    }

    console.log(`GEMINI_API_KEY set: ${!!process.env.GEMINI_API_KEY}`);
    console.log(`CRON_SECRET set: ${!!process.env.CRON_SECRET}`);
    console.log(`DATABASE_URL set: ${!!process.env.DATABASE_URL}`);
  } catch (err) {
    console.error('Error during check:', err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
