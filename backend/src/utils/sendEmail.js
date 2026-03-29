import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT), // convert từ string sang number
    secure: false, // TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // App Password
    },
  });

  await transporter.sendMail({
    from: `"ShopHub" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  });
};
