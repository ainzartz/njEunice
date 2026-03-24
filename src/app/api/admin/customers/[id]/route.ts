import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureAdmin } from '@/lib/admin-auth';
import bcrypt from 'bcryptjs';
import { encrypt, decrypt } from '@/lib/encryption';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminAuth = await ensureAdmin();
    if (!adminAuth.authorized) return adminAuth.response;

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
    const {
      passwordHash,
      firstNameEncrypted,
      lastNameEncrypted,
      phoneEncrypted,
      addressEncrypted,
      dobEncrypted,
      interestCities,
      ...userData
    } = user;

    const decryptedUser = {
      ...userData,
      firstName: firstNameEncrypted ? decrypt(firstNameEncrypted) : '',
      lastName: lastNameEncrypted ? decrypt(lastNameEncrypted) : '',
      phone: phoneEncrypted ? decrypt(phoneEncrypted) : '',
      address: addressEncrypted ? decrypt(addressEncrypted) : '',
      dob: dobEncrypted ? decrypt(dobEncrypted) : '',
      hasPassword: !!passwordHash,
      interestedCityIds: interestCities.map(ic => ic.cityId),
      interestType: user.interestType || '',
      minPrice: user.minPrice,
      maxPrice: user.maxPrice,
      minBeds: user.minBeds,
      minBaths: user.minBaths
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
    const adminAuth = await ensureAdmin();
    if (!adminAuth.authorized) return adminAuth.response;

    const { id } = await params;
    if (!id) return NextResponse.json({ message: 'Missing ID' }, { status: 400 });

    const data = await req.json();
    if (!data) return NextResponse.json({ message: 'Missing data' }, { status: 400 });

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
      interestedCityIds,
      interestType,
      minPrice,
      maxPrice,
      minBeds,
      minBaths
    } = data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Check for email conflict
    if (email && email !== existingUser.email) {
      const conflict = await prisma.user.findUnique({ where: { email } });
      if (conflict) {
        return NextResponse.json({ message: 'Email already in use' }, { status: 409 });
      }
    }

    const updateData: any = {};

    if (email) updateData.email = email;
    if (firstName !== undefined) updateData.firstNameEncrypted = encrypt(firstName || '');
    if (lastName !== undefined) updateData.lastNameEncrypted = encrypt(lastName || '');
    if (firstName !== undefined || lastName !== undefined) {
      const fName = firstName !== undefined ? firstName : (existingUser.firstNameEncrypted ? decrypt(existingUser.firstNameEncrypted) : '');
      const lName = lastName !== undefined ? lastName : (existingUser.lastNameEncrypted ? decrypt(existingUser.lastNameEncrypted) : '');
      updateData.nameEncrypted = encrypt(`${fName} ${lName}`.trim());
    }
    if (phone !== undefined) updateData.phoneEncrypted = encrypt(phone || '');
    if (address !== undefined) updateData.addressEncrypted = encrypt(address || '');
    if (dob !== undefined) updateData.dobEncrypted = encrypt(dob || '');

    if (data.isDeleted !== undefined) {
      updateData.isDeleted = !!data.isDeleted;
    }

    if (autoEmail !== undefined) updateData.autoEmail = !!autoEmail;
    if (autoSms !== undefined) updateData.autoSms = !!autoSms;
    if (isAdmin !== undefined) updateData.isAdmin = !!isAdmin;
    if (isLogin !== undefined) updateData.isLogin = !!isLogin;

    // Preference parsing with more robust checks
    if (interestType !== undefined) {
      updateData.interestType = (interestType && interestType !== '') ? interestType : null;
    }

    const parseNum = (v: any, isFloat = false) => {
      if (v === undefined || v === null || v.toString().trim() === '') return null;
      const clean = v.toString().replace(/,/g, '');
      const num = isFloat ? parseFloat(clean) : parseInt(clean);
      return isNaN(num) ? null : num;
    };

    if (minPrice !== undefined) updateData.minPrice = parseNum(minPrice);
    if (maxPrice !== undefined) updateData.maxPrice = parseNum(maxPrice);
    if (minBeds !== undefined) updateData.minBeds = parseNum(minBeds);
    if (minBaths !== undefined) updateData.minBaths = parseNum(minBaths, true);

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
      if (Array.isArray(interestedCityIds)) {
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
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminAuth = await ensureAdmin();
    if (!adminAuth.authorized) return adminAuth.response;
    const currentUser = adminAuth.user!;

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
