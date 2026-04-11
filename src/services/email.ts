import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)
const FROM = process.env.RESEND_FROM || 'CuraLog <noreply@dataprimetech.com>'

interface SendEmailParams {
  to: string | string[]
  subject: string
  html: string
  from?: string
}

export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) { console.warn('RESEND_API_KEY not set'); return false }
  try {
    const { error } = await resend.emails.send({
      from: params.from || FROM,
      to: Array.isArray(params.to) ? params.to : [params.to],
      subject: params.subject,
      html: params.html,
    })
    if (error) { console.error('Resend error:', error); return false }
    return true
  } catch (e) {
    console.error('Email send error:', e)
    return false
  }
}

export function refillRequestedEmail(patientName: string, medName: string, requestedBy: string, appUrl: string) {
  return emailLayout({
    title: 'New Refill Request',
    preheader: `${requestedBy} submitted a refill request for ${patientName}'s ${medName}`,
    body: `
      <p style="margin:0 0 6px;font-size:1rem;font-weight:700;color:#111827;">New refill request</p>
      <p style="margin:0 0 24px;font-size:0.875rem;color:#6b7280;line-height:1.6;">
        <strong style="color:#111827;">${requestedBy}</strong> submitted a refill request for
        <strong style="color:#111827;">${patientName}</strong>'s <strong style="color:#111827;">${medName}</strong>.
      </p>
      <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
        <p style="margin:0 0 4px;font-size:0.7rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#9ca3af;">Patient</p>
        <p style="margin:0 0 14px;font-size:0.95rem;font-weight:700;color:#111827;">${patientName}</p>
        <p style="margin:0 0 4px;font-size:0.7rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#9ca3af;">Medication</p>
        <p style="margin:0;font-size:0.95rem;font-weight:700;color:#111827;">${medName}</p>
      </div>
      <a href="${appUrl}/owner/requests" style="display:inline-block;background:#0d9488;color:#fff;font-size:0.875rem;font-weight:600;padding:12px 24px;border-radius:8px;text-decoration:none;">
        Review Request
      </a>
    `,
  })
}

export function refillStatusEmail(patientName: string, medName: string, status: string, appUrl: string) {
  const statusLabels: Record<string, string> = {
    submitted: 'Submitted to prescriber',
    at_prescriber: 'At prescriber',
    at_pharmacy: 'Sent to pharmacy',
    ready: 'Ready for pickup',
    picked_up: 'Picked up',
    denied: 'Denied',
  }
  const label = statusLabels[status] || status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  const isReady = status === 'ready'

  return emailLayout({
    title: 'Refill Status Update',
    preheader: `${patientName}'s ${medName} refill: ${label}`,
    accentColor: isReady ? '#059669' : '#0d9488',
    body: `
      <p style="margin:0 0 24px;font-size:0.875rem;color:#6b7280;line-height:1.6;">
        The refill status for <strong style="color:#111827;">${patientName}</strong>'s
        <strong style="color:#111827;">${medName}</strong> has been updated.
      </p>
      <div style="background:${isReady ? '#f0fdf4' : '#f8fafc'};border:1px solid ${isReady ? '#bbf7d0' : '#e5e7eb'};border-radius:12px;padding:20px 24px;margin-bottom:24px;">
        <p style="margin:0 0 4px;font-size:0.7rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#9ca3af;">Current Status</p>
        <p style="margin:0;font-size:1rem;font-weight:700;color:${isReady ? '#065f46' : '#111827'};">${label}</p>
      </div>
      <a href="${appUrl}/owner/requests" style="display:inline-block;background:#0d9488;color:#fff;font-size:0.875rem;font-weight:600;padding:12px 24px;border-radius:8px;text-decoration:none;">
        View in CuraLog
      </a>
    `,
  })
}

export function refillReminderEmail(patientName: string, medName: string, daysLeft: number) {
  const isUrgent = daysLeft <= 7
  return emailLayout({
    title: 'Refill Reminder',
    preheader: `${patientName} has ${daysLeft} day${daysLeft !== 1 ? 's' : ''} of ${medName} remaining`,
    accentColor: isUrgent ? '#dc2626' : '#0d9488',
    body: `
      <p style="margin:0 0 6px;font-size:1rem;font-weight:700;color:#111827;">Hi ${patientName},</p>
      <p style="margin:0 0 24px;font-size:0.875rem;color:#6b7280;line-height:1.6;">
        This is a friendly reminder that your <strong style="color:#111827;">${medName}</strong> supply is running low.
      </p>
      <div style="background:${isUrgent ? '#fef2f2' : '#fef9c3'};border:1px solid ${isUrgent ? '#fecaca' : '#fde68a'};border-radius:12px;padding:20px 24px;margin-bottom:24px;text-align:center;">
        <p style="margin:0 0 4px;font-size:0.75rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${isUrgent ? '#991b1b' : '#92400e'};">Supply Remaining</p>
        <p style="margin:0;font-size:2rem;font-weight:800;color:${isUrgent ? '#dc2626' : '#92400e'};">${daysLeft} day${daysLeft !== 1 ? 's' : ''}</p>
      </div>
      <p style="margin:0 0 20px;font-size:0.875rem;color:#4b5563;line-height:1.6;">
        Please contact your pharmacy or care team to request a refill before you run out.
      </p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/owner" style="display:inline-block;background:#0d9488;color:#fff;font-size:0.875rem;font-weight:600;padding:12px 24px;border-radius:8px;text-decoration:none;">
        Open CuraLog
      </a>
    `,
  })
}

// ── Shared layout ──────────────────────────────────────────────────────────────
function emailLayout(opts: {
  title: string
  preheader?: string
  accentColor?: string
  body: string
}) {
  const accent = opts.accentColor || '#0d9488'
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${opts.title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f7f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;-webkit-font-smoothing:antialiased;">
  ${opts.preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${opts.preheader}&nbsp;‌&nbsp;‌&nbsp;‌</div>` : ''}
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f4f7f6;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;">
        <tr><td style="background:${accent};border-radius:12px 12px 0 0;padding:24px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td style="color:#fff;font-size:1.05rem;font-weight:800;letter-spacing:-0.3px;">CuraLog</td>
              <td align="right" style="color:rgba(255,255,255,0.7);font-size:0.75rem;">${opts.title}</td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="background:#ffffff;padding:32px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
          ${opts.body}
        </td></tr>
        <tr><td style="background:#f9fafb;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:18px 32px;text-align:center;">
          <p style="margin:0;font-size:0.72rem;color:#9ca3af;line-height:1.6;">
            CuraLog by <strong style="color:#6b7280;">DataPrimeTech</strong> &middot; Care Coordination Platform
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}
