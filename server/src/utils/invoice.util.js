import PDFDocument from "pdfkit";

function formatCurrency(amount, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(Number(amount || 0));
}

function formatAddress(address = {}) {
  return [
    address.line1,
    address.line2,
    [address.city, address.state].filter(Boolean).join(", "),
    [address.postalCode, address.country].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join("\n");
}

function drawTableHeader(doc, y) {
  doc
    .fontSize(10)
    .fillColor("#64748b")
    .text("Item", 50, y)
    .text("Qty", 330, y, { width: 60, align: "center" })
    .text("Price", 390, y, { width: 80, align: "right" })
    .text("Total", 470, y, { width: 80, align: "right" });

  doc.moveTo(50, y + 16).lineTo(550, y + 16).strokeColor("#cbd5e1").stroke();
}

export async function generateInvoicePdfBuffer({ order, customer, options = {} }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const currency = options.currency || "INR";
    const taxRate = Number(options.taxRate || 0);
    const invoiceId = options.invoiceId || `INV-${order._id.toString().slice(-8).toUpperCase()}`;

    const subtotal = Number(order.subtotal || 0);
    const discount = Number(order.discount || 0);
    const taxableAmount = Math.max(subtotal - discount, 0);
    const taxAmount = Number((taxableAmount * taxRate).toFixed(2));
    const grandTotal = Number((taxableAmount + taxAmount).toFixed(2));

    doc
      .rect(0, 0, doc.page.width, 130)
      .fill("#0f172a")
      .fillColor("#f8fafc")
      .fontSize(30)
      .text("NOOR FIT", 50, 45, { align: "left" })
      .fontSize(12)
      .fillColor("#94a3b8")
      .text("Modest Fashion | Premium Quality", 50, 84)
      .fillColor("#f8fafc")
      .fontSize(16)
      .text("TAX INVOICE", 400, 52, { align: "right", width: 150 });

    doc.fillColor("#0f172a").fontSize(10);
    doc.text(`Invoice #: ${invoiceId}`, 50, 150);
    doc.text(`Order ID: ${order._id.toString()}`, 50, 165);
    doc.text(
      `Order Date: ${new Date(order.createdAt || new Date()).toLocaleDateString("en-IN")}`,
      50,
      180,
    );
    doc.text(
      `Delivered On: ${order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString("en-IN") : "-"}`,
      50,
      195,
    );

    doc
      .fontSize(11)
      .fillColor("#0f172a")
      .text("Bill To", 50, 230)
      .fontSize(10)
      .fillColor("#334155")
      .text(customer?.name || "Customer", 50, 246)
      .text(formatAddress(order.shippingAddress), 50, 260, { width: 250 });

    drawTableHeader(doc, 350);

    let y = 374;
    order.items.forEach((item) => {
      const itemTotal = Number(item.qty || 0) * Number(item.price || 0);
      doc
        .fontSize(10)
        .fillColor("#0f172a")
        .text(item.name || "Item", 50, y, { width: 260 })
        .text(String(item.qty || 1), 330, y, { width: 60, align: "center" })
        .text(formatCurrency(item.price, currency), 390, y, { width: 80, align: "right" })
        .text(formatCurrency(itemTotal, currency), 470, y, { width: 80, align: "right" });

      y += 24;
      doc.moveTo(50, y - 6).lineTo(550, y - 6).strokeColor("#e2e8f0").stroke();
    });

    const totalsY = Math.max(y + 10, 560);

    doc
      .fontSize(10)
      .fillColor("#334155")
      .text("Subtotal", 390, totalsY, { width: 80, align: "right" })
      .text(formatCurrency(subtotal, currency), 470, totalsY, { width: 80, align: "right" })
      .text("Discount", 390, totalsY + 18, { width: 80, align: "right" })
      .text(`- ${formatCurrency(discount, currency)}`, 470, totalsY + 18, { width: 80, align: "right" });

    if (taxRate > 0) {
      doc
        .text(`GST (${(taxRate * 100).toFixed(0)}%)`, 390, totalsY + 36, {
          width: 80,
          align: "right",
        })
        .text(formatCurrency(taxAmount, currency), 470, totalsY + 36, {
          width: 80,
          align: "right",
        });
    }

    const grandY = taxRate > 0 ? totalsY + 62 : totalsY + 42;
    doc
      .fontSize(12)
      .fillColor("#0f172a")
      .text("Grand Total", 390, grandY, { width: 80, align: "right" })
      .text(formatCurrency(grandTotal, currency), 470, grandY, { width: 80, align: "right" });

    doc
      .fontSize(9)
      .fillColor("#64748b")
      .text(
        "This is a system-generated invoice and does not require a signature.",
        50,
        760,
        { align: "center", width: 500 },
      );

    doc.end();
  });
}
