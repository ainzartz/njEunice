import nodemailer from 'nodemailer';

export async function sendEmail(to: string, subject: string, html: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  });
}

export async function sendSMS(to: string, message: string) {
  // Mock SMS implementation
  console.log(`[MOCK SMS] To: ${to}, Message: ${message}`);
  // In future, integrate Twilio or other provider here
}
