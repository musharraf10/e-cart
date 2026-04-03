import nodemailer from "nodemailer";

let transporter;
let verifyPromise;

function normalizeEnvValue(value) {
  if (value === undefined || value === null) return "";

  return String(value)
    .trim()
    .replace(/^['\"]|['\"]$/g, "");
}

function parsePort(rawPort) {
  const parsed = Number(rawPort);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 465;
}

function resolveSender() {
  const configuredFrom = normalizeEnvValue(process.env.EMAIL_FROM);
  const user = normalizeEnvValue(process.env.EMAIL_USER);
  const host = normalizeEnvValue(process.env.EMAIL_HOST).toLowerCase();

  if (!configuredFrom) {
    return { from: user, replyTo: undefined };
  }

  // Gmail SMTP commonly rejects spoofed sender domains.
  if (host.includes("gmail")) {
    const fromAddressMatch = configuredFrom.match(/<([^>]+)>/);
    const fromAddress = (fromAddressMatch?.[1] || configuredFrom).toLowerCase();

    if (fromAddress !== user.toLowerCase()) {
      return { from: user, replyTo: configuredFrom };
    }
  }

  return { from: configuredFrom, replyTo: undefined };
}

function buildTransporter() {
  if (transporter) return transporter;

  const host = normalizeEnvValue(process.env.EMAIL_HOST);
  const port = parsePort(normalizeEnvValue(process.env.EMAIL_PORT));
  const user = normalizeEnvValue(process.env.EMAIL_USER);
  const pass = normalizeEnvValue(process.env.EMAIL_PASS);

  if (!host || !user || !pass) {
    throw new Error(
      "Email configuration is missing. Please set EMAIL_HOST, EMAIL_PORT, EMAIL_USER and EMAIL_PASS.",
    );
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  verifyPromise = transporter
    .verify()
    .then(() => {
      console.log("[EMAIL] SMTP connection verified");
    })
    .catch((error) => {
      console.error("[EMAIL] SMTP verification failed:", error.message);
    });

  return transporter;
}

export async function sendEmail({ to, subject, html, text, attachments = [] }) {
  if (!to || !subject || !html) {
    throw new Error("sendEmail requires to, subject and html");
  }

  const client = buildTransporter();

  // Best-effort wait so first email includes quick SMTP diagnostics in logs.
  await verifyPromise;

  const { from, replyTo } = resolveSender();

  return client.sendMail({
    from,
    replyTo,
    to,
    subject,
    html,
    text,
    attachments,
  });
}
