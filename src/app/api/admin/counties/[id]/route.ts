import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || !currentUser.isAdmin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

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
