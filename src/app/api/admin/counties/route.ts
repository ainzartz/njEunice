import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureAdmin } from '@/lib/admin-auth';

// GET all counties
export async function GET() {
  try {
    const adminAuth = await ensureAdmin();
    if (!adminAuth.authorized) return adminAuth.response;

    const counties = await prisma.county.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(counties);
  } catch (error) {
    console.error('Error fetching counties:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
