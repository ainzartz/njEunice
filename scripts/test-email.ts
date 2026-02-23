import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  console.log("Testing email configuration...");
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // verify connection configuration
    transporter.verify(function (error, success) {
      if (error) {
        console.error("Transporter Verification Error:");
        console.error(error);
      } else {
        console.log("Server is ready to take our messages");
      }
    });

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // send to self
      subject: "Test Email from NextJS App",
      html: "<p>This is a test email.</p>",
    });

    console.log("Message sent: %s", info.messageId);
  } catch (err) {
    console.error("Caught error during send:", err);
  }
}

main();
