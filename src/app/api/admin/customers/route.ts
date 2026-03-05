import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureAdmin } from '@/lib/admin-auth';
import bcrypt from 'bcryptjs';
import { encrypt } from '@/lib/encryption';

export async function POST(req: NextRequest) {
  try {
    const adminAuth = await ensureAdmin();
    if (!adminAuth.authorized) return adminAuth.response;

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
      interestedCityIds,
      interestType,
      minPrice,
      maxPrice,
      minBeds,
      minBaths
    } = data;

    if (!email || !firstName || !lastName) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    if ((isLogin || isAdmin) && !password) {
      return NextResponse.json({ message: 'Password is required for login-enabled users' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'User already exists with this email' }, { status: 409 });
    }


    const passwordHash = password ? await bcrypt.hash(password, 10) : undefined;
    const firstNameEncrypted = encrypt(firstName);
    const lastNameEncrypted = encrypt(lastName);
    const nameEncrypted = encrypt(`${firstName} ${lastName}`.trim());
    const phoneEncrypted = encrypt(phone || '');
    const addressEncrypted = encrypt(address || '');
    const dobEncrypted = encrypt(dob || '');

    // Transaction to ensure User, PasswordHistory, and Regions are created together
    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          firstNameEncrypted,
          lastNameEncrypted,
          nameEncrypted,
          phoneEncrypted,
          addressEncrypted,
          dobEncrypted,
          autoEmail: !!autoEmail,
          autoSms: !!autoSms,
          isAdmin: !!isAdmin,
          isLogin: !!isLogin,
          interestType: interestType || null,
          minPrice: minPrice ? parseInt(minPrice) : null,
          maxPrice: maxPrice ? parseInt(maxPrice) : null,
          minBeds: minBeds ? parseInt(minBeds) : null,
          minBaths: minBaths ? parseFloat(minBaths) : null,
        },
      });

      if (passwordHash) {
        await tx.passwordHistory.create({
          data: {
            userId: newUser.id,
            passwordHash,
          }
        });
      }

      if (interestedCityIds && interestedCityIds.length > 0) {
        const interestData = interestedCityIds.map((cityId: string) => ({
          userId: newUser.id,
          cityId: cityId,
        }));

        await tx.userInterestCity.createMany({
          data: interestData,
          skipDuplicates: true,
        });
      }

      return newUser;
    });

    return NextResponse.json({ message: 'User created successfully', userId: result.id }, { status: 201 });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
