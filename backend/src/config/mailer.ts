import nodemailer, { Transporter } from 'nodemailer';
import { env } from './env';

/**
 * Nodemailer transporter — configured lazily to avoid startup failure
 * when SMTP credentials are not yet set (dev environment).
 */
let _transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (_transporter) return _transporter;

  _transporter = nodemailer.createTransport({
    host: env.SMTP_HOST ?? 'localhost',
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth:
      env.SMTP_USER && env.SMTP_PASS
        ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
        : undefined,
  });

  return _transporter;
}

// ─── Email senders ────────────────────────────────────────────────────────────

export interface ConferenceRegEmailData {
  to: string;
  fullName: string;
  registrationCode: string;
  conferenceTitleAr: string;
  conferenceTitleEn?: string | null;
}

/**
 * إرسال بريد تأكيد التسجيل في المؤتمر
 */
export async function sendConferenceRegistrationEmail(data: ConferenceRegEmailData): Promise<void> {
  const from = env.SMTP_FROM ?? `"كلية الآثار — جامعة القاهرة" <noreply@fa-arch.cu.edu.eg>`;

  try {
    await getTransporter().sendMail({
      from,
      to: data.to,
      subject: `تأكيد التسجيل في ${data.conferenceTitleAr}`,
      html: buildRegistrationEmailHtml(data),
      text: buildRegistrationEmailText(data),
    });
    console.log(`📧 Registration email sent to ${data.to}`);
  } catch (err) {
    // نسجّل الخطأ لكن ما نوقفش الـ response — البريد اختياري
    console.error(`❌ Failed to send registration email to ${data.to}:`, err);
  }
}

/**
 * إرسال بريد تأكيد القبول في المؤتمر
 */
export async function sendRegistrationApprovalEmail(data: ConferenceRegEmailData): Promise<void> {
  const from = env.SMTP_FROM ?? `"كلية الآثار — جامعة القاهرة" <noreply@fa-arch.cu.edu.eg>`;

  try {
    await getTransporter().sendMail({
      from,
      to: data.to,
      subject: `تأكيد القبول في ${data.conferenceTitleAr}`,
      html: buildApprovalEmailHtml(data),
      text: buildApprovalEmailText(data),
    });
    console.log(`📧 Approval email sent to ${data.to}`);
  } catch (err) {
    console.error(`❌ Failed to send approval email to ${data.to}:`, err);
  }
}

// ─── Email templates ──────────────────────────────────────────────────────────

function buildRegistrationEmailHtml(data: ConferenceRegEmailData): string {
  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>تأكيد التسجيل</title>
</head>
<body style="font-family: Arial, sans-serif; direction: rtl; background: #f9f9f9; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; padding: 32px; border: 1px solid #e5e7eb;">
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="color: #1e3a5f; font-size: 24px; margin: 0;">كلية الآثار — جامعة القاهرة</h1>
      <p style="color: #6b7280; margin: 8px 0 0;">Faculty of Archaeology — Cairo University</p>
    </div>
    <hr style="border: none; border-top: 2px solid #C9A84C; margin: 24px 0;">
    <h2 style="color: #1e3a5f;">تأكيد تسجيلك في المؤتمر</h2>
    <p>عزيزي/عزيزتي <strong>${data.fullName}</strong>،</p>
    <p>يسعدنا إعلامك بأنه تم استلام طلب تسجيلك في:</p>
    <div style="background: #f3f4f6; border-radius: 6px; padding: 16px; margin: 16px 0;">
      <p style="margin: 0; font-weight: bold; color: #1e3a5f;">${data.conferenceTitleAr}</p>
      ${data.conferenceTitleEn ? `<p style="margin: 4px 0 0; color: #6b7280; font-size: 14px;">${data.conferenceTitleEn}</p>` : ''}
    </div>
    <p>رقم تسجيلك المرجعي:</p>
    <div style="background: #1e3a5f; color: #C9A84C; text-align: center; padding: 12px; border-radius: 6px; font-size: 20px; font-weight: bold; letter-spacing: 2px;">
      ${data.registrationCode}
    </div>
    <p style="margin-top: 16px; color: #6b7280; font-size: 14px;">
      احتفظ بهذا الرقم للرجوع إليه. سيتم إرسال تأكيد القبول النهائي قريباً.
    </p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
    <p style="color: #9ca3af; font-size: 12px; text-align: center;">
      كلية الآثار — جامعة القاهرة | fa-arch.cu.edu.eg
    </p>
  </div>
</body>
</html>`;
}

function buildRegistrationEmailText(data: ConferenceRegEmailData): string {
  return `
عزيزي/عزيزتي ${data.fullName}،

تم استلام طلب تسجيلك في: ${data.conferenceTitleAr}
${data.conferenceTitleEn ? `(${data.conferenceTitleEn})` : ''}

رقم تسجيلك المرجعي: ${data.registrationCode}

احتفظ بهذا الرقم للرجوع إليه.

كلية الآثار — جامعة القاهرة
fa-arch.cu.edu.eg
  `.trim();
}

function buildApprovalEmailHtml(data: ConferenceRegEmailData): string {
  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><title>تأكيد القبول</title></head>
<body style="font-family: Arial, sans-serif; direction: rtl; background: #f9f9f9; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; padding: 32px; border: 1px solid #e5e7eb;">
    <h1 style="color: #1e3a5f;">كلية الآثار — جامعة القاهرة</h1>
    <hr style="border: none; border-top: 2px solid #4A7C59; margin: 16px 0;">
    <h2 style="color: #4A7C59;">✅ تم قبول تسجيلك</h2>
    <p>عزيزي/عزيزتي <strong>${data.fullName}</strong>،</p>
    <p>يسعدنا إعلامك بأنه تم <strong>قبول تسجيلك</strong> في:</p>
    <p style="font-weight: bold; color: #1e3a5f;">${data.conferenceTitleAr}</p>
    <p>رقم التسجيل: <strong style="color: #1e3a5f;">${data.registrationCode}</strong></p>
    <p>نتطلع إلى مشاركتك.</p>
    <p style="color: #9ca3af; font-size: 12px; text-align: center;">كلية الآثار — جامعة القاهرة</p>
  </div>
</body>
</html>`;
}

function buildApprovalEmailText(data: ConferenceRegEmailData): string {
  return `عزيزي/عزيزتي ${data.fullName}،\n\nتم قبول تسجيلك في: ${data.conferenceTitleAr}\nرقم التسجيل: ${data.registrationCode}\n\nكلية الآثار — جامعة القاهرة`;
}
