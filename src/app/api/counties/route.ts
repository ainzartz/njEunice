import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureInternalRequest } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  // Security check: only allow requests from our own domain
  const authError = ensureInternalRequest(req);
  if (authError) return authError;

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
