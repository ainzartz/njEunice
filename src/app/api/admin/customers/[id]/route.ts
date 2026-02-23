import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-server';
import bcrypt from 'bcryptjs';
import { encrypt, decrypt } from '@/lib/encryption';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.isAdmin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        interestCities: {
          include: {
            city: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Decrypt sensitive information
    const decryptedUser = {
      ...user,
      firstName: user.firstNameEncrypted ? decrypt(user.firstNameEncrypted) : '',
      lastName: user.lastNameEncrypted ? decrypt(user.lastNameEncrypted) : '',
      phone: user.phoneEncrypted ? decrypt(user.phoneEncrypted) : '',
      address: user.addressEncrypted ? decrypt(user.addressEncrypted) : '',
      dob: user.dobEncrypted ? decrypt(user.dobEncrypted) : '',
      passwordHash: undefined, // Hide password hash
      hasPassword: !!user.passwordHash,
      interestedCityIds: user.interestCities.map(ic => ic.cityId)
    };

    return NextResponse.json(decryptedUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.isAdmin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const data = await req.json();

    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      address,
      dob,
      autoEmail,
      autoSms,
      isAdmin,
      isLogin,
      interestedCityIds
    } = data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const updateData: any = {};

    if (email) updateData.email = email;
    if (firstName) updateData.firstNameEncrypted = encrypt(firstName);
    if (lastName) updateData.lastNameEncrypted = encrypt(lastName);
    if (firstName || lastName) {
      updateData.nameEncrypted = encrypt(`${firstName || ''} ${lastName || ''}`.trim());
    }
    if (phone !== undefined) updateData.phoneEncrypted = encrypt(phone || '');
    if (address !== undefined) updateData.addressEncrypted = encrypt(address || '');
    if (dob !== undefined) updateData.dobEncrypted = encrypt(dob || '');

    if (data.isDeleted !== undefined) {
      updateData.isDeleted = data.isDeleted;
    }

    updateData.autoEmail = !!autoEmail;
    updateData.autoSms = !!autoSms;
    updateData.isAdmin = !!isAdmin;
    updateData.isLogin = !!isLogin;

    let newPasswordHash: string | undefined = undefined;
    if (password) {
      newPasswordHash = await bcrypt.hash(password, 10);
      updateData.passwordHash = newPasswordHash;
      updateData.lastPasswordChangeAt = new Date();
    }

    await prisma.$transaction(async (tx) => {
      // Update User
      await tx.user.update({
        where: { id },
        data: updateData
      });

      // Update Password History if password changed
      if (newPasswordHash) {
        await tx.passwordHistory.create({
          data: {
            userId: id,
            passwordHash: newPasswordHash
          }
        });
      }

      // Update Interest Cities
      if (interestedCityIds !== undefined) {
        // Delete all old interests
        await tx.userInterestCity.deleteMany({
          where: { userId: id }
        });

        // Add new interests
        if (interestedCityIds.length > 0) {
          const interestData = interestedCityIds.map((cityId: string) => ({
            userId: id,
            cityId: cityId,
          }));

          await tx.userInterestCity.createMany({
            data: interestData,
            skipDuplicates: true,
          });
        }
      }
    });

    return NextResponse.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.isAdmin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Prevent deleting self
    if (currentUser.id === id) {
      return NextResponse.json({ message: 'Cannot delete yourself' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id },
      data: { isDeleted: true }
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
