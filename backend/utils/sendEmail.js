import nodemailer from "nodemailer";

// Transactional email via plain SMTP, so any provider works (Gmail/Google
// Workspace app password, Zoho, Hostinger, Brevo, SendGrid, Amazon SES...).
// If SMTP isn't configured the email is logged instead of sent, so local
// development and the rest of the app keep working.

let transporter;

export const isEmailConfigured = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const getTransporter = () => {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT) || 587;
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
};

const fromAddress = () =>
  process.env.EMAIL_FROM || `GADCO ZEN <${process.env.SMTP_USER || "no-reply@gadcozen.com"}>`;

// Never throws — a failed email must not fail the order/request that triggered it.
export const sendEmail = async ({ to, subject, html, text, attachments }) => {
  if (!to) return false;
  if (!isEmailConfigured()) {
    console.log(`[email] SMTP not configured — would send "${subject}" to ${to}`);
    return false;
  }
  try {
    await getTransporter().sendMail({ from: fromAddress(), to, subject, html, text, attachments });
    return true;
  } catch (err) {
    console.error(`[email] Failed to send "${subject}" to ${to}: ${err.message}`);
    return false;
  }
};

export const clientUrl = () =>
  (process.env.CLIENT_URL || "http://localhost:5173").split(",")[0].trim().replace(/\/$/, "");
