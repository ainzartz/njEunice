import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';
import { signToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Check if last login was > 30 days ago
    if (user.lastLoginAt) {
      const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
      const timeSinceLastLogin = Date.now() - new Date(user.lastLoginAt).getTime();

      if (timeSinceLastLogin > thirtyDaysInMs) {
        return NextResponse.json({
          error: 'Security policy requires password reset after 30 days of inactivity.',
          resetRequired: true
        }, { status: 403 });
      }
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate Token
    const token = signToken({ userId: user.id, email: user.email, isAdmin: user.isAdmin });

    // Check if password reset is required (90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    let mustChangePassword = false;
    if (user.lastPasswordChangeAt && user.lastPasswordChangeAt < ninetyDaysAgo) {
      mustChangePassword = true;
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.isAdmin ? 'ADMIN' : 'USER'
      },
      mustChangePassword,
      redirect: mustChangePassword ? '/auth/update-password' : undefined
    });

    // Set Cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
