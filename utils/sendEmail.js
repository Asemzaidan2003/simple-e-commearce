import nodemailer from "nodemailer";

/**
 * Creates a reusable transporter from environment variables.
 * Supports any SMTP provider: Gmail, SendGrid, Mailgun, etc.
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host:   process.env.EMAIL_HOST,
    port:   parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_PORT === "465", // true for port 465, false for others
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Core send function
 * @param {object} options - { to, subject, html, text }
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME || "E-Commerce"}" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    text,
  });
};

// ─── Email Templates ──────────────────────────────────────────────────────────

/**
 * Welcome email sent after successful registration
 */
export const sendWelcomeEmail = async (user) => {
  await sendEmail({
    to:      user.user_email,
    subject: "Welcome! Your account is ready",
    html: `
      <h2>Welcome, ${user.user_name_en}!</h2>
      <p>Your account has been created successfully.</p>
      <p>You can now browse products and place orders.</p>
    `,
    text: `Welcome ${user.user_name_en}! Your account has been created successfully.`,
  });
};

/**
 * Order confirmation email sent to customer after order is placed
 */
export const sendOrderConfirmationEmail = async (user, order) => {
  const itemRows = order.items
    .map(
      (item) =>
        `<tr>
          <td>${item.product_name}</td>
          <td>${item.quantity}</td>
          <td>${item.product_price.toFixed(2)}</td>
          <td>${(item.product_price * item.quantity).toFixed(2)}</td>
        </tr>`
    )
    .join("");

  await sendEmail({
    to:      user.user_email,
    subject: `Order Confirmed — #${order._id}`,
    html: `
      <h2>Thank you for your order, ${user.user_name_en}!</h2>
      <p>Your order <strong>#${order._id}</strong> has been received and is being processed.</p>

      <h3>Order Summary</h3>
      <table border="1" cellpadding="8" cellspacing="0">
        <thead>
          <tr>
            <th>Product</th><th>Qty</th><th>Unit Price</th><th>Total</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <p><strong>Subtotal:</strong> ${order.pricing.subtotal.toFixed(2)}</p>
      ${order.pricing.discount_amount > 0
        ? `<p><strong>Discount (${order.pricing.discount_code}):</strong> -${order.pricing.discount_amount.toFixed(2)}</p>`
        : ""}
      <p><strong>Shipping:</strong> ${order.pricing.shipping_fee.toFixed(2)}</p>
      <p><strong>Total:</strong> ${order.pricing.total.toFixed(2)}</p>

      <p>Payment method: ${order.payment.method}</p>
    `,
    text: `Order #${order._id} confirmed. Total: ${order.pricing.total.toFixed(2)}`,
  });
};

/**
 * Order status update email (shipped, delivered, cancelled, etc.)
 */
export const sendOrderStatusEmail = async (user, order) => {
  const statusMessages = {
    processing:          "Your order is now being processed.",
    Ready_for_Shipment:  "Your order is packed and ready to ship.",
    Ready_for_Pickup:    "Your order is ready for pickup!",
    shipped:             "Your order is on its way!",
    delivered:           "Your order has been delivered. Enjoy!",
    cancelled:           `Your order has been cancelled.${order.cancelled_reason ? ` Reason: ${order.cancelled_reason}` : ""}`,
  };

  const message = statusMessages[order.status] || `Your order status has been updated to: ${order.status}`;

  await sendEmail({
    to:      user.user_email,
    subject: `Order Update — #${order._id}: ${order.status}`,
    html: `
      <h2>Order Update</h2>
      <p>Hi ${user.user_name_en},</p>
      <p>${message}</p>
      <p>Order ID: <strong>#${order._id}</strong></p>
    `,
    text: `Order #${order._id} update: ${message}`,
  });
};

/**
 * Password reset email
 * @param {object} user
 * @param {string} resetToken - Short-lived JWT or random token
 */
export const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  await sendEmail({
    to:      user.user_email,
    subject: "Password Reset Request",
    html: `
      <h2>Password Reset</h2>
      <p>Hi ${user.user_name_en},</p>
      <p>You requested a password reset. Click the link below (valid for 1 hour):</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>If you didn't request this, ignore this email.</p>
    `,
    text: `Password reset link: ${resetUrl}`,
  });
};

export default sendEmail;
