import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 });
    }

    // Password Policy: Min 8 chars, 1 number, 1 special char
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
    // Simplified: length >= 8 and at least one non-alphanumeric?
    // Or just length >= 8 and mix of types.

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long.' }, { status: 400 });
    }

    // Check for complexity (at least one number and one special char)
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

    if (!hasNumber || !hasSpecial) {
      return NextResponse.json({ error: 'Password must contain at least one number and one special character.' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        lastLoginAt: new Date(), // Consider logging in immediately or requiring login
      },
    });

    return NextResponse.json({ success: true, message: 'Password reset successful.' });

  } catch (error) {
    console.error('Reset Password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
