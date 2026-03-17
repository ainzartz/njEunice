import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/jwt';
import { decrypt } from '@/lib/encryption';
import { ensureInternalRequest } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  // Security check: only allow requests from our own domain
  const authError = ensureInternalRequest(request);
  if (authError) return authError;

  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Verify the code
    const verification = await prisma.verificationCode.findFirst({
      where: {
        email: normalizedEmail,
        code,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!verification) {
      return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 });
    }

    // 2. Find the user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail, isDeleted: false },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 3. Finalize Login Logic (moved from login/route.ts)

    // Check if password reset is required (90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    let mustChangePassword = false;
    if (user.lastPasswordChangeAt && user.lastPasswordChangeAt < ninetyDaysAgo) {
      mustChangePassword = true;
    }

    const decryptedFirstName = user.firstNameEncrypted ? decrypt(user.firstNameEncrypted) : '';
    const decryptedLastName = user.lastNameEncrypted ? decrypt(user.lastNameEncrypted) : '';

    // Generate Final Token
    const token = signToken({ userId: user.id, email: user.email, isAdmin: user.isAdmin });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: `${decryptedFirstName} ${decryptedLastName}`.trim(),
        role: user.isAdmin ? 'ADMIN' : 'USER'
      },
      mustChangePassword,
      redirect: mustChangePassword ? '/auth/update-password' : undefined
    });

    // Set Secure HttpOnly Cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });

    // Optionally delete the used code
    await prisma.verificationCode.delete({
      where: { id: verification.id }
    });

    return response;

  } catch (error) {
    console.error('2FA Verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
