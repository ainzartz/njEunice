import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';
import { decrypt } from '@/lib/encryption';
import { ensureInternalRequest } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  // Security check: only allow requests from our own domain
  const authError = ensureInternalRequest(request);
  if (authError) return authError;

  try {
    const { firstName, lastName, email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user) {
      // Update opt-out preferences
      await prisma.user.update({
        where: { id: user.id },
        data: {
          autoEmail: false,
          autoSms: false,
        },
      });

      // Decrypt phone if available for the email content
      const phone = user.phoneEncrypted ? decrypt(user.phoneEncrypted) : 'N/A';

      // Send confirmation email
      const emailUser = process.env.EMAIL_USER;
      const emailPass = process.env.EMAIL_PASS;

      if (emailUser && emailPass) {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: emailUser,
            pass: emailPass,
          },
        });

        const mailOptions = {
          from: `"NJ Eunice Real Estate" <${emailUser}>`,
          to: normalizedEmail,
          subject: 'Marketing Opt-Out Confirmation',
          text: `Hello ${firstName || ''} ${lastName || ''},\n\nThis email confirms that you have successfully opted out of marketing communications from NJ Eunice Real Estate.\n\nAutomated Email and SMS communications to this address (${normalizedEmail}) and your registered phone number (${phone}) have been legally terminated in our system.\n\nPlease allow up to 48 hours for this change to take full effect across all our systems.\n\nThank you.`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee;">
              <h2 style="color: #000; border-bottom: 2px solid #000; pb: 10px;">Opt-Out Confirmation</h2>
              <p>Hello ${firstName || ''} ${lastName || ''},</p>
              <p>This email serves as formal confirmation that your request to opt out of marketing communications has been processed.</p>
              <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #000; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Verified Email:</strong> ${normalizedEmail}</p>
                <p style="margin: 5px 0;"><strong>Registered Phone:</strong> ${phone}</p>
                <p style="margin: 5px 0;"><strong>Status:</strong> Legally Terminated</p>
              </div>
              <p>Automated Email and SMS communications have been ceased in our database. Please allow up to 48 hours for global propagation across all sub-processors.</p>
              <p style="font-size: 12px; color: #999; margin-top: 30px; border-top: 1px solid #eee; pt: 10px;">
                This is a legal notice regarding your communication preferences.
              </p>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
      }
    }

    // Always return success to match user requirement ("존재 하지 않으면 아무것도 하실필요가 없고")
    return NextResponse.json({ success: true, message: 'Opt-out processed successfully' });

  } catch (error) {
    console.error('Opt-out error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
