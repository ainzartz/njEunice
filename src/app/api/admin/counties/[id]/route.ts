import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureAdmin } from '@/lib/admin-auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminAuth = await ensureAdmin();
    if (!adminAuth.authorized) return adminAuth.response;

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ message: 'County ID is required' }, { status: 400 });
    }

    const data = await request.json();
    const { isTarget } = data;

    if (typeof isTarget !== 'boolean') {
      return NextResponse.json({ message: 'Invalid payload: isTarget must be a boolean' }, { status: 400 });
    }

    const updatedCounty = await prisma.county.update({
      where: { id },
      data: { isTarget },
    });

    return NextResponse.json(updatedCounty);
  } catch (error) {
    console.error('Error updating county:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
