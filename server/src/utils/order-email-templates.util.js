const BRAND = {
  name: "Noor Fit",
  tagline: "Modest Fashion | Premium Quality",
  supportEmail: process.env.SUPPORT_EMAIL || "support@noorfit.com",
  supportPhone: process.env.SUPPORT_PHONE || "+91 90000 00000",
  instagramUrl: process.env.INSTAGRAM_URL || "https://instagram.com/noorfit",
  whatsappUrl: process.env.WHATSAPP_URL || "https://wa.me/919000000000",
  logoUrl:
    process.env.EMAIL_LOGO_URL ||
    "https://dummyimage.com/240x64/0f172a/f8fafc&text=Noor+Fit",
};

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatCurrency(amount, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(Number(amount || 0));
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function renderItemsTable(items = [], currency = "INR") {
  const rows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 8px;color:#dbeafe;font-size:14px;border-bottom:1px solid #334155;">${escapeHtml(item.name || "Item")}</td>
          <td style="padding:10px 8px;color:#cbd5e1;font-size:14px;border-bottom:1px solid #334155;text-align:center;">${escapeHtml(item.qty || 1)}</td>
          <td style="padding:10px 8px;color:#e2e8f0;font-size:14px;border-bottom:1px solid #334155;text-align:right;">${escapeHtml(formatCurrency(item.price, currency))}</td>
        </tr>
      `,
    )
    .join("");

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #334155;border-radius:10px;overflow:hidden;">
      <thead>
        <tr style="background:#0f172a;">
          <th align="left" style="padding:10px 8px;color:#f1f5f9;font-size:12px;letter-spacing:0.3px;text-transform:uppercase;">Item</th>
          <th align="center" style="padding:10px 8px;color:#f1f5f9;font-size:12px;letter-spacing:0.3px;text-transform:uppercase;">Qty</th>
          <th align="right" style="padding:10px 8px;color:#f1f5f9;font-size:12px;letter-spacing:0.3px;text-transform:uppercase;">Price</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function applyPlaceholders(template, payload) {
  return Object.entries(payload || {}).reduce(
    (compiled, [key, value]) => compiled.replaceAll(`{{${key}}}`, String(value ?? "")),
    template,
  );
}

function baseTemplate({ preheader, title, summary, detailRows, bodyHtml, ctaLabel, ctaUrl }) {
  return `
<!doctype html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${title}</title>
  <style>
    @media (max-width: 640px) {
      .container { width: 100% !important; }
      .pad { padding: 22px !important; }
      .title { font-size: 26px !important; }
    }
  </style>
</head>
<body style="margin:0;background:#020617;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e2e8f0;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#020617;padding:24px 8px;">
    <tr>
      <td align="center">
        <table role="presentation" width="640" class="container" cellpadding="0" cellspacing="0" style="width:640px;max-width:640px;background:linear-gradient(180deg,#0b1120 0%,#0a1931 100%);border:1px solid #1e293b;border-radius:20px;overflow:hidden;">
          <tr>
            <td class="pad" style="padding:30px 34px 16px; text-align:center; border-bottom:1px solid #1e293b;">
              <img src="${BRAND.logoUrl}" alt="Noor Fit" style="width:190px;max-width:190px;height:auto;" />
              <p style="margin:10px 0 0;font-size:13px;color:#94a3b8;letter-spacing:0.4px;">${BRAND.tagline}</p>
            </td>
          </tr>
          <tr>
            <td class="pad" style="padding:28px 34px;">
              <h1 class="title" style="margin:0 0 8px;font-size:30px;line-height:1.2;color:#f8fafc;">${title}</h1>
              <p style="margin:0 0 18px;color:#cbd5e1;font-size:15px;line-height:1.6;">${summary}</p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:18px;border:1px solid #334155;border-radius:12px;background:#0b1223;">
                ${detailRows}
              </table>

              ${bodyHtml}

              ${
                ctaUrl
                  ? `<p style="margin:22px 0 6px;"><a href="${ctaUrl}" style="display:inline-block;background:#22c55e;color:#052e16;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:10px;">${ctaLabel}</a></p>`
                  : ""
              }
            </td>
          </tr>
          <tr>
            <td class="pad" style="padding:20px 34px 28px;border-top:1px solid #1e293b;">
              <p style="margin:0 0 8px;font-size:14px;color:#94a3b8;">Need help? Reach us at <a style="color:#93c5fd;text-decoration:none;" href="mailto:${BRAND.supportEmail}">${BRAND.supportEmail}</a> or ${BRAND.supportPhone}.</p>
              <p style="margin:0 0 8px;font-size:13px;color:#64748b;">© ${new Date().getUTCFullYear()} Noor Fit. All rights reserved.</p>
              <p style="margin:0;font-size:13px;"><a href="${BRAND.instagramUrl}" style="color:#93c5fd;text-decoration:none;">Instagram</a> · <a href="${BRAND.whatsappUrl}" style="color:#93c5fd;text-decoration:none;">WhatsApp Support</a></p>
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

function detailsBlock({ orderId, totalAmount, date, paymentMethod, trackingNumber, expectedDelivery }) {
  const rows = [
    ["Order ID", orderId],
    ["Date", date],
    ["Total", totalAmount],
    ["Payment", paymentMethod],
  ];

  if (trackingNumber) rows.push(["Tracking", trackingNumber]);
  if (expectedDelivery) rows.push(["Expected delivery", expectedDelivery]);

  return rows
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding:12px 14px;color:#94a3b8;font-size:13px;border-bottom:1px solid #334155;">${escapeHtml(label)}</td>
        <td style="padding:12px 14px;color:#f8fafc;font-size:14px;font-weight:600;border-bottom:1px solid #334155;text-align:right;">${escapeHtml(value)}</td>
      </tr>`,
    )
    .join("");
}

function buildTemplateData(order, extra = {}) {
  return {
    customerName: escapeHtml(extra.customerName || "Customer"),
    orderId: escapeHtml(order?._id?.toString()?.slice(-8) || "{{orderId}}"),
    totalAmount: escapeHtml(formatCurrency(order?.total, extra.currency || "INR")),
    date: escapeHtml(formatDate(order?.createdAt || new Date())),
    items: renderItemsTable(order?.items || [], extra.currency || "INR"),
    paymentMethod: escapeHtml((order?.paymentMethod || "online").toUpperCase()),
    trackingNumber: escapeHtml(extra.trackingNumber || "TBA"),
    expectedDelivery: escapeHtml(extra.expectedDelivery || "2-5 business days"),
  };
}

export function renderOrderConfirmationTemplate(order, options = {}) {
  const data = buildTemplateData(order, options);
  const summary = applyPlaceholders(
    "Hi {{customerName}}, thank you for shopping with Noor Fit. Your order is confirmed and being prepared.",
    data,
  );

  return baseTemplate({
    preheader: `Order {{orderId}} confirmed`,
    title: "Order Confirmed 🎉",
    summary,
    detailRows: detailsBlock(data),
    bodyHtml: `<div style="margin-top:18px;"><p style="margin:0 0 12px;color:#cbd5e1;font-size:14px;">Here’s what you ordered:</p>${data.items}</div>`,
    ctaLabel: "Track Your Order",
    ctaUrl: options.trackUrl,
  });
}

export function renderOrderShippedTemplate(order, options = {}) {
  const data = buildTemplateData(order, options);
  const summary = applyPlaceholders(
    "Great news {{customerName}}! Your order {{orderId}} has been shipped and is on its way.",
    data,
  );

  return baseTemplate({
    preheader: `Order {{orderId}} shipped`,
    title: "Your Order Is On The Way 🚚",
    summary,
    detailRows: detailsBlock(data),
    bodyHtml: `<p style="margin:0 0 14px;color:#cbd5e1;font-size:14px;line-height:1.6;">Keep this email for reference. Your tracking details are included above.</p>`,
    ctaLabel: "Track Shipment",
    ctaUrl: options.trackUrl,
  });
}

export function renderOrderDeliveredTemplate(order, options = {}) {
  const data = buildTemplateData(order, options);
  const summary = applyPlaceholders(
    "Hi {{customerName}}, your order {{orderId}} has been delivered. Your invoice is attached for your records.",
    data,
  );

  return baseTemplate({
    preheader: `Order {{orderId}} delivered`,
    title: "Delivered Successfully ✅",
    summary,
    detailRows: detailsBlock(data),
    bodyHtml:
      "<p style=\"margin:0 0 14px;color:#cbd5e1;font-size:14px;line-height:1.6;\">We hope you love your purchase. If anything is not perfect, reply to this email and our support team will help right away.</p>",
    ctaLabel: "View Order",
    ctaUrl: options.orderUrl,
  });
}

export function renderPaymentSuccessTemplate(order, options = {}) {
  const data = buildTemplateData(order, options);
  const summary = applyPlaceholders(
    "Payment received successfully for order {{orderId}}. We’ll notify you once it ships.",
    data,
  );

  return baseTemplate({
    preheader: `Payment successful for {{orderId}}`,
    title: "Payment Success 💳",
    summary,
    detailRows: detailsBlock(data),
    bodyHtml: "<p style=\"margin:0 0 14px;color:#cbd5e1;font-size:14px;line-height:1.6;\">Your payment has been verified and your order is now in processing.</p>",
    ctaLabel: "View Order",
    ctaUrl: options.orderUrl,
  });
}
