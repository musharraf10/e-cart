const BRAND_NAME = "Noor Fit";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function baseAuthTemplate({ title, heading, intro, ctaLabel, ctaUrl, expiryText, footerText }) {
  return `
<!doctype html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:20px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;">
          <tr>
            <td style="padding:28px 28px 18px;border-bottom:1px solid #e2e8f0;">
              <p style="margin:0;font-size:14px;color:#64748b;">${BRAND_NAME}</p>
              <h1 style="margin:10px 0 0;font-size:24px;line-height:1.3;color:#0f172a;">${escapeHtml(heading)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:22px 28px;">
              <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#334155;">${intro}</p>
              <p style="margin:0 0 16px;">
                <a href="${ctaUrl}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:8px;">${escapeHtml(ctaLabel)}</a>
              </p>
              <p style="margin:0;font-size:13px;color:#64748b;">${escapeHtml(expiryText)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px 24px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">${escapeHtml(footerText)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

export function renderVerificationEmailTemplate({ name, verifyUrl }) {
  return baseAuthTemplate({
    title: "Verify your Noor Fit account",
    heading: `Welcome to Noor Fit, ${name || "there"}!`,
    intro:
      "Please verify your email address to activate your account and start shopping.",
    ctaLabel: "Verify Email",
    ctaUrl: verifyUrl,
    expiryText: "This verification link expires in 24 hours.",
    footerText:
      "If you did not create this account, you can safely ignore this email.",
  });
}

export function renderPasswordResetEmailTemplate({ resetUrl }) {
  return baseAuthTemplate({
    title: "Reset your Noor Fit password",
    heading: "Password reset request",
    intro:
      "We received a request to reset your password. Use the button below to set a new one.",
    ctaLabel: "Reset Password",
    ctaUrl: resetUrl,
    expiryText: "This password reset link expires in 30 minutes.",
    footerText:
      "If you did not request a password reset, you can ignore this email.",
  });
}
