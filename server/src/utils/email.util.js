import nodemailer from "nodemailer";

let transporter;

function buildTransporter() {
  if (transporter) return transporter;

  const host = process.env.EMAIL_HOST;
  const port = Number(process.env.EMAIL_PORT) || 465;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!host || !user || !pass) {
    throw new Error("Email configuration is missing");
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  transporter.verify((error, success) => {
    if (error) {
      console.log("Nodemailer Error:", error);
    } else {
      console.log("Server is ready to take our messages");
    }
  });

  return transporter;
}

export async function sendEmail({ to, subject, html, text, attachments = [] }) {
  if (!to || !subject || !html) {
    throw new Error("sendEmail requires to, subject and html");
  }

  const sender = process.env.EMAIL_FROM || process.env.EMAIL_USER;
  const client = buildTransporter();

  return client.sendMail({
    from: sender,
    to,
    subject,
    html,
    text,
    attachments,
  });
}
