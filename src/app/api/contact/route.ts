import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';
import { encrypt } from '@/lib/encryption';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { firstName, lastName, email, phone, message } = data;

    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Find or create the user based on the email
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Auto-register new user
      const firstNameEncrypted = encrypt(firstName);
      const lastNameEncrypted = encrypt(lastName);
      const nameEncrypted = encrypt(`${firstName} ${lastName}`.trim());
      const phoneEncrypted = encrypt(phone || '');
      const addressEncrypted = encrypt('');
      const dobEncrypted = encrypt('');

      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          firstNameEncrypted,
          lastNameEncrypted,
          nameEncrypted,
          phoneEncrypted,
          addressEncrypted,
          dobEncrypted,
          isAdmin: false,
          isLogin: false,
        },
      });
    }

    // 2. Save the message to the database
    await prisma.message.create({
      data: {
        userId: user.id,
        content: message,
        isInbound: true, // Message from user to admin
      },
    });

    // 3. Notify all active administrators
    const admins = await prisma.user.findMany({
      where: {
        isAdmin: true,
        isDeleted: false,
      },
      select: {
        email: true,
      },
    });

    if (admins.length > 0) {
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

        const adminEmails = admins.map(admin => admin.email).join(', ');

        const mailOptions = {
          from: `"NJ Eunice Real Estate" <${emailUser}>`,
          to: adminEmails,
          replyTo: normalizedEmail,
          subject: `New Message from ${firstName} ${lastName}`,
          text: `You have received a new message.\n\nName: ${firstName} ${lastName}\nEmail: ${normalizedEmail}\nPhone: ${phone || 'N/A'}\n\nMessage:\n${message}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
              <h2 style="color: #000;">New Contact Message</h2>
              <p><strong>Name:</strong> ${firstName} ${lastName}</p>
              <p><strong>Email:</strong> ${normalizedEmail}</p>
              <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
              <p><strong>Message:</strong></p>
              <p style="white-space: pre-wrap; background-color: #f9f9f9; padding: 15px; border-radius: 5px;">${message}</p>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
      } else {
        console.warn("EMAIL_USER or EMAIL_PASS is not configured, admin notification skipped.");
      }
    }

    return NextResponse.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error processing contact form submission:', error);
    return NextResponse.json({ error: 'Failed to process submission' }, { status: 500 });
  }
}
