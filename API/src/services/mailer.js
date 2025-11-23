import nodemailer from 'nodemailer';
import { config } from '../config/env.js';

let transporter = null;
function getTransporter() {
  if (!config.smtpHost || !config.smtpPort) return null;
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure,
    auth: config.smtpUser ? { user: config.smtpUser, pass: config.smtpPass } : undefined,
  });
  return transporter;
}

export async function sendMail({ to, subject, html, text }) {
  const tx = getTransporter();
  if (!tx) {
    // Dev fallback: log link to console when SMTP not configured
    console.log('[mailer:dev]', { to, subject, text, html: (html || '').slice(0, 200) });
    return { ok: false, simulated: true };
  }
  const info = await tx.sendMail({ from: config.smtpUser || 'no-reply@hilcoe-rms', to, subject, text, html });
  return { ok: true, id: info.messageId };
}

