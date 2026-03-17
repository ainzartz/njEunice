import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';
import { encrypt } from '@/lib/encryption';
import { ensureInternalRequest } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  // Security check: only allow requests from our own domain
  const authError = ensureInternalRequest(request);
  if (authError) return authError;

  try {
    const data = await request.json();
    const { firstName, lastName, email, phone, message, propertyAddress, propertyMlsId, propertyZip, consent } = data;

    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Find or create the user based on the email
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Auto-register new guest user
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
          autoEmail: consent === true,
          autoSms: consent === true,
          isAdmin: false,
          isLogin: false,
        },
      });
    } else if (consent === true) {
      // Update existing user with consent if they didn't have it
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          autoEmail: true,
          autoSms: true,
        },
      });
    }

    // 2. Save the message to the database
    // Prepend property details so admins know which listing this inquiry is about
    const fullMessageContent = `[Inquiry for Property: ${propertyAddress} (MLS# ${propertyMlsId || 'Unknown'})]\n\n${message}`;

    await prisma.message.create({
      data: {
        userId: user.id,
        content: fullMessageContent,
        isInbound: true,
      },
    });

    // 3. Optional: Map property ZipCode to an Interested City, if available
    if (propertyZip) {
      try {
        const zipRecord = await prisma.zipCode.findUnique({
          where: { code: propertyZip },
          include: { city: true }
        });

        if (zipRecord && zipRecord.cityId) {
          // Add this city to the User's InterestCities if not already there
          const existingInterest = await prisma.userInterestCity.findUnique({
            where: {
              userId_cityId: {
                userId: user.id,
                cityId: zipRecord.cityId
              }
            }
          });

          if (!existingInterest) {
            await prisma.userInterestCity.create({
              data: {
                userId: user.id,
                cityId: zipRecord.cityId
              }
            });
          }
        }
      } catch (zipError) {
        // Ignore zip mapping errors silently
      }
    }

    // 4. Notify all active administrators
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
          subject: `New Property Inquiry from ${firstName} ${lastName}`,
          text: `You have received a new property inquiry.\n\nProperty: ${propertyAddress} (MLS# ${propertyMlsId || 'Unknown'})\n\nName: ${firstName} ${lastName}\nEmail: ${normalizedEmail}\nPhone: ${phone || 'N/A'}\n\nMessage:\n${message}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
              <h2 style="color: #000;">New Property Inquiry</h2>
              <div style="background-color: #f0f7ff; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                <strong>Property details:</strong>
                <p style="margin: 5px 0 0 0;">${propertyAddress}</p>
                <p style="margin: 5px 0 0 0;">MLS# ${propertyMlsId || 'Unknown'}</p>
              </div>
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

    return NextResponse.json({ success: true, message: 'Property inquiry sent successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process inquiry' }, { status: 500 });
  }
}
