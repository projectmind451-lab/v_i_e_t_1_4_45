import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// Branding helpers
function getBranding() {
  const brandName = process.env.BRAND_NAME || "Vinitamart";
  const logoUrl = process.env.LOGO_URL || "";
  return { brandName, logoUrl };
}

function getLogoHtmlAndAttachments() {
  const { brandName, logoUrl } = getBranding();
  if (!logoUrl) return { headerLogoHtml: "", attachments: [] };
  const isHttp = /^https?:\/\//i.test(logoUrl);
  if (isHttp) {
    const headerLogoHtml = `<img src="${logoUrl}" alt="${brandName}" style="height:28px; width:auto; display:block; border-radius:4px; background:#ffffff; padding:2px;"/>`;
    return { headerLogoHtml, attachments: [] };
  }
  // local file path: embed as CID
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const candidates = [
    logoUrl,
    path.resolve(process.cwd(), logoUrl),
    path.resolve(__dirname, "..", "..", logoUrl),
  ];
  // Special handling for paths like ./src/assets/... (assume project/client)
  const cleaned = logoUrl.replace(/^\.\//, "");
  if (cleaned.startsWith("src/")) {
    candidates.push(path.resolve(__dirname, "..", "..", "client", cleaned));
  }
  const existingPath = candidates.find((p) => {
    try { return fs.existsSync(p); } catch { return false; }
  });
  if (existingPath) {
    const cid = "brandLogo";
    const headerLogoHtml = `<img src="cid:${cid}" alt="${brandName}" style="height:28px; width:auto; display:block; border-radius:4px; background:#ffffff; padding:2px;"/>`;
    return {
      headerLogoHtml,
      attachments: [
        {
          filename: existingPath.split(/[/\\]/).pop() || "logo.png",
          path: existingPath,
          cid,
        },
      ],
    };
  }
  return { headerLogoHtml: "", attachments: [] };
}

// Shared helpers
function renderTemplate({ title, bodyHtml, headerLogoHtml }) {
  const { brandName } = getBranding();
  return `
  <div style="font-family: Arial, Helvetica, sans-serif; background:#f6f7f9; padding:24px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
      <tr>
        <td style="padding:18px 22px; background:#0ea5e9; color:#ffffff;">
          <div style="display:flex; align-items:center; gap:12px;">
            ${headerLogoHtml || ""}
            <div>
              <div style="font-size:18px; font-weight:700;">${brandName}</div>
              <div style="font-size:12px; opacity:.95;">${title || "Notification"}</div>
            </div>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding:22px; color:#111827;">${bodyHtml}</td>
      </tr>
      <tr>
        <td style="padding:14px 22px; background:#f9fafb; color:#6b7280; font-size:12px;">
          <div>This is an automated message from ${brandName}. Please do not reply.</div>
          <div style="margin-top:4px;">Need help? Contact support at <a href="mailto:support@vinitamart.com" style="color:#0ea5e9;text-decoration:none;">support@vinitamart.com</a></div>
        </td>
      </tr>
    </table>
  </div>`;
}

function codePill(content) {
  return `<span style="display:inline-block; font-size:16px; letter-spacing:0.5px; font-weight:700; color:#111827; background:#f3f4f6; border:1px dashed #d1d5db; padding:8px 10px; border-radius:8px;">${content}</span>`;
}

export async function sendNewOrderNotificationToSeller({ orderId, amount, itemsCount, customerName, customerEmail, paymentType }) {
  const transporter = createTransporter();
  const to = process.env.SELLER_EMAIL;
  if (!to) return; // no seller email configured
  const subject = `New order received: ${orderId}`;
  const text = `A new order has been placed.\n\nOrder ID: ${orderId}\nCustomer: ${customerName || ""} (${customerEmail || ""})\nItems: ${itemsCount}\nAmount: ${amount}\nPayment: ${paymentType}\nTime: ${new Date().toLocaleString()}\n\nPlease review in the seller dashboard.`;
  const bodyHtml = `
    <p style="margin:0 0 8px 0;">A new order has been placed.</p>
    <table role="presentation" cellspacing="0" cellpadding="0" style="width:100%;font-size:14px;color:#374151">
      <tr><td style="padding:6px 0;width:140px;color:#6b7280">Order ID</td><td>${codePill(orderId)}</td></tr>
      <tr><td style="padding:6px 0;width:140px;color:#6b7280">Customer</td><td>${(customerName || "").trim()} (${customerEmail || ""})</td></tr>
      <tr><td style="padding:6px 0;width:140px;color:#6b7280">Items</td><td>${itemsCount}</td></tr>
      <tr><td style="padding:6px 0;width:140px;color:#6b7280">Amount</td><td>${amount}</td></tr>
      <tr><td style="padding:6px 0;width:140px;color:#6b7280">Payment</td><td>${paymentType}</td></tr>
      <tr><td style="padding:6px 0;width:140px;color:#6b7280">Time</td><td>${new Date().toLocaleString()}</td></tr>
    </table>
    <p style="margin:14px 0 0 0;">Review details in the seller dashboard.</p>
  `;
  const { headerLogoHtml, attachments } = getLogoHtmlAndAttachments();
  const html = renderTemplate({ title: "New Order Notification", bodyHtml, headerLogoHtml });

  await transporter.sendMail({
    from: `Vinitamart <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html,
    attachments,
  });
}

export async function sendOrderUpdate({ to, orderId, status, name }) {
  const transporter = createTransporter();
  const subject = `Your order ${orderId} is now ${status}`;
  const text = `Hello ${name || "Customer"},\n\nYour order ${orderId} status has been updated to: ${status}.\n\nThank you for shopping with Vinitamart.`;
  const bodyHtml = `
    <p style="margin:0 0 10px 0;">Hello ${name || "Customer"},</p>
    <p style="margin:0 0 12px 0;">Your order ${codePill(orderId)} status is now <strong>${status}</strong>.</p>
    <p style="margin:0;">Thank you for shopping with Vinitamart.</p>
  `;
  const { headerLogoHtml: headerLogoHtml2, attachments: attachments2 } = getLogoHtmlAndAttachments();
  const html = renderTemplate({ title: "Order Status Update", bodyHtml, headerLogoHtml: headerLogoHtml2 });

  await transporter.sendMail({
    from: `Vinitamart <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html,
    attachments: attachments2,
  });
}

export async function sendOrderConfirmation({ to, orderId, amount, name }) {
  const transporter = createTransporter();
  const subject = `Order placed successfully: ${orderId}`;
  const text = `Hello ${name || "Customer"},\n\nThank you for your order!\nOrder ID: ${orderId}\nTotal: ${amount}\n\nWe will notify you when it ships.\n\n— Vinitamart`;
  const bodyHtml = `
    <p style="margin:0 0 10px 0;">Hello ${name || "Customer"},</p>
    <p style="margin:0 0 10px 0;">Thank you for your order!</p>
    <table role="presentation" cellspacing="0" cellpadding="0" style="width:100%;font-size:14px;color:#374151">
      <tr><td style="padding:6px 0;width:140px;color:#6b7280">Order ID</td><td>${codePill(orderId)}</td></tr>
      <tr><td style="padding:6px 0;width:140px;color:#6b7280">Total</td><td><strong>${amount}</strong></td></tr>
    </table>
    <p style="margin:12px 0 0 0;">We will notify you when it ships.</p>
  `;
  const { headerLogoHtml: headerLogoHtml3, attachments: attachments3 } = getLogoHtmlAndAttachments();
  const html = renderTemplate({ title: "Order Confirmation", bodyHtml, headerLogoHtml: headerLogoHtml3 });

  await transporter.sendMail({
    from: `Vinitamart <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html,
    attachments: attachments3,
  });
}
