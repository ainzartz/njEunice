import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-server';

// GET all counties
export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || !currentUser.isAdmin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const counties = await prisma.county.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(counties);
  } catch (error) {
    console.error('Error fetching counties:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
