import { User } from "../models/user.model.js";
import { sendEmail } from "../utils/email.util.js";
import {
  renderOrderConfirmationTemplate,
  renderOrderDeliveredTemplate,
  renderOrderShippedTemplate,
  renderPaymentSuccessTemplate,
} from "../utils/order-email-templates.util.js";
import { generateInvoicePdfBuffer } from "../utils/invoice.util.js";

function createOrderUrls(orderId) {
  const clientUrl = process.env.CLIENT_URL || "http://10.16.38.220:5173/";
  const safeId = encodeURIComponent(orderId.toString());

  return {
    orderUrl: `${clientUrl}/account/orders/${safeId}`,
    trackUrl: `${clientUrl}/account/orders/${safeId}`,
  };
}

async function loadEmailRecipient(order) {
  const user = await User.findById(order.user).select("name email");
  if (!user?.email) return null;

  return user;
}

export async function sendOrderConfirmationEmail(order) {
  const user = await loadEmailRecipient(order);
  if (!user) return;

  const links = createOrderUrls(order._id);

  await sendEmail({
    to: user.email,
    subject: `Noor Fit • Order Confirmed #${order._id.toString().slice(-8).toUpperCase()}`,
    html: renderOrderConfirmationTemplate(order, {
      customerName: user.name,
      trackUrl: links.trackUrl,
      orderUrl: links.orderUrl,
    }),
  });
}

export async function sendPaymentSuccessEmail(order) {
  const user = await loadEmailRecipient(order);
  if (!user) return;

  const links = createOrderUrls(order._id);

  await sendEmail({
    to: user.email,
    subject: `Noor Fit • Payment Successful #${order._id.toString().slice(-8).toUpperCase()}`,
    html: renderPaymentSuccessTemplate(order, {
      customerName: user.name,
      orderUrl: links.orderUrl,
    }),
  });
}

export async function sendOrderShippedEmail(order) {
  const user = await loadEmailRecipient(order);
  if (!user) return;

  const links = createOrderUrls(order._id);

  await sendEmail({
    to: user.email,
    subject: `Noor Fit • Order Shipped #${order._id.toString().slice(-8).toUpperCase()}`,
    html: renderOrderShippedTemplate(order, {
      customerName: user.name,
      trackUrl: links.trackUrl,
      trackingNumber: order?.shippingTrackingNumber || "Assigned soon",
    }),
  });
}

export async function sendOrderDeliveredEmail(order) {
  const user = await loadEmailRecipient(order);
  if (!user) return;

  const links = createOrderUrls(order._id);
  const invoiceBuffer = await generateInvoicePdfBuffer({
    order,
    customer: user,
    options: {
      taxRate: Number(process.env.INVOICE_TAX_RATE || 0),
      currency: process.env.INVOICE_CURRENCY || "INR",
    },
  });

  await sendEmail({
    to: user.email,
    subject: `Noor Fit • Delivered #${order._id.toString().slice(-8).toUpperCase()} (Invoice attached)`,
    html: renderOrderDeliveredTemplate(order, {
      customerName: user.name,
      orderUrl: links.orderUrl,
    }),
    attachments: [
      {
        filename: `invoice-${order._id.toString().slice(-8).toUpperCase()}.pdf`,
        content: invoiceBuffer,
        contentType: "application/pdf",
      },
    ],
  });
}

export async function sendStatusEmailByOrder(order, status) {
  if (status === "shipped") {
    return sendOrderShippedEmail(order);
  }

  if (status === "delivered") {
    return sendOrderDeliveredEmail(order);
  }

  return null;
}
