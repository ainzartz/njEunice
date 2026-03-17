import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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

    // Find the latest valid code for this email
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
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired verification code.'
      }, { status: 400 });
    }

    // Success - In a real app we might delete the code here to prevent multi-use,
    // but for simplicity and to handle potential re-submissions/refresh, we'll keep it.
    // However, the expiry will still be enforced on the NEXT attempt.

    return NextResponse.json({ success: true, message: 'Email verified successfully.' });
  } catch (error) {
    console.error('Error confirming code:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
