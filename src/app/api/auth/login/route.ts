import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';
import { signToken } from '@/lib/jwt';
import { decrypt } from '@/lib/encryption';
import { ensureInternalRequest } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  // Security check: only allow requests from our own domain
  const authError = ensureInternalRequest(request);
  if (authError) return authError;

  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email, isDeleted: false },
    });

    if (!user || (!user.isLogin && !user.isAdmin)) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (!user.passwordHash) {
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

    // Credential verification successful. Now trigger 2FA dispatch.

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes

    // Store in DB
    await prisma.verificationCode.create({
      data: {
        email: user.email.toLowerCase().trim(),
        code,
        expiresAt,
      },
    });

    // Send Email
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"NJ Eunice Real Estate" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Login Verification Code - NJ Eunice Real Estate',
      text: `Your login verification code is: ${code}\n\nThis code will expire in 3 minutes.`,
      html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #000;">Login Verification</h2>
                <p>Please use the following code to complete your sign-in:</p>
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; font-size: 24px; letter-spacing: 5px; font-weight: bold; text-align: center; margin: 20px 0;">
                    ${code}
                </div>
                <p style="font-size: 12px; color: #666;">This code will expire in 3 minutes. If you did not request this login, please change your password immediately.</p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      mfaRequired: true,
      email: user.email
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
