import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { sendEmail, sendSMS } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user || user.isDeleted) {
      // Return success even if user not found to prevent enumeration
      // Also silently ignore deleted users
      return NextResponse.json({ success: true, message: 'If account exists, reset link sent.' });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry,
      },
    });

    // Send Email
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetLink = `${origin}/auth/reset-password?token=${token}`;
    const html = `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset because your password expired or you forgot it.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>This link expires in 1 hour.</p>
    `;

    try {
      await sendEmail(user.email, 'Password Reset Request', html);
    } catch (e) {
      console.error("Failed to send email:", e);
      return NextResponse.json({ error: 'Failed to deliver email. Please try again later.' }, { status: 500 });
    }

    // Send SMS (Mock)
    if (user.phoneEncrypted) {
      // Decrypt phone if needed, but for now just mock
      await sendSMS(user.id, `Reset link: ${resetLink}`);
    }

    return NextResponse.json({ success: true, message: 'Reset link sent.' });

  } catch (error) {
    console.error('Request Reset error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
