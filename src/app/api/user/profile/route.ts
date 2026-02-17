import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/encryption';

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { firstName, lastName, phone, address, dob, autoEmail, autoSms } = body;

    // Validate input if necessary (e.g. check lengths)

    const updateData: any = {};

    if (firstName !== undefined) updateData.firstNameEncrypted = encrypt(firstName);
    if (lastName !== undefined) updateData.lastNameEncrypted = encrypt(lastName);
    if (phone !== undefined) updateData.phoneEncrypted = encrypt(phone);
    if (address !== undefined) updateData.addressEncrypted = encrypt(address);
    if (dob !== undefined) updateData.dobEncrypted = encrypt(dob);
    if (autoEmail !== undefined) updateData.autoEmail = autoEmail;
    if (autoSms !== undefined) updateData.autoSms = autoSms;

    await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
