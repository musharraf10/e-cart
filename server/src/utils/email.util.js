import nodemailer from "nodemailer";

let transporter;

function buildTransporter() {
  if (transporter) return transporter;

  const host = process.env.EMAIL_HOST;
  const port = Number(process.env.EMAIL_PORT || 587);
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

  return transporter;
}

export async function sendEmail({ to, subject, html }) {
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
  });
}
