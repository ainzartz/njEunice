import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const counties = await prisma.county.findMany({
      where: {
        isTarget: true
      },
      orderBy: { name: 'asc' },
      include: {
        cities: {
          orderBy: { name: 'asc' },
          include: {
            zipCodes: {
              orderBy: { code: 'asc' }
            }
          }
        }
      }
    });
    return NextResponse.json(counties);
  } catch (error) {
    console.error('Error fetching counties:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
