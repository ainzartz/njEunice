import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
      console.error('Missing EMAIL_USER or EMAIL_PASS environment variables');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes from now

    // Store in database with expiry
    try {
      await prisma.verificationCode.create({
        data: {
          email: email.toLowerCase().trim(),
          code,
          expiresAt,
        },
      });
      console.log('Verification code stored in DB');
    } catch (dbError: any) {
      console.error('Error storing verification code in DB:', dbError);
      return NextResponse.json({
        error: 'Failed to initialize verification',
        details: dbError.message || 'Database connection or schema error'
      }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    });

    const mailOptions = {
      from: `"NJ Eunice Real Estate" <${user}>`,
      to: email,
      subject: 'Your Verification Code - NJ Eunice Real Estate',
      text: `Your verification code is: ${code}\n\nThis code will expire in 3 minutes.`,
      html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #000;">Verification Code</h2>
                <p>Please use the following code to verify your email address:</p>
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; font-size: 24px; letter-spacing: 5px; font-weight: bold; text-align: center; margin: 20px 0;">
                    ${code}
                </div>
                <p style="font-size: 12px; color: #666;">This code will expire in 3 minutes. If you did not request this code, please ignore this email.</p>
            </div>
        `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Verification email sent to:', email);
    } catch (mailError: any) {
      console.error('Nodemailer Error:', mailError);
      return NextResponse.json({
        error: 'Failed to send email',
        details: mailError.message || 'Gmail service error'
      }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Top-level error in email verify route:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
