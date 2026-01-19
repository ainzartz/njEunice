import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

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

    // Create a hash of the code to send back to the client for verification
    // In a real production app, we would store this in Redis with a TTL.
    // For this stateless implementation, we trust the client logic with this hash.
    const hash = crypto.createHash('sha256').update(code).digest('hex');

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
      text: `Your verification code is: ${code}\n\nThis code will expire in 10 minutes.`,
      html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #000;">Verification Code</h2>
                <p>Please use the following code to verify your email address:</p>
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; font-size: 24px; letter-spacing: 5px; font-weight: bold; text-align: center; margin: 20px 0;">
                    ${code}
                </div>
                <p style="font-size: 12px; color: #666;">If you did not request this code, please ignore this email.</p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, hash });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
