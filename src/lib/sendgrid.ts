import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)
const FROM = process.env.RESEND_FROM || 'CuraLog <noreply@dataprimetech.com>'

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]+>/g, ''),
  })
  if (error) throw new Error(`Resend error: ${error.message}`)
  return true
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
  <meta name="color-scheme" content="light">
  <title>${opts.title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f7f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;-webkit-font-smoothing:antialiased;">
  ${opts.preheader ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${opts.preheader}&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌</div>` : ''}
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f4f7f6;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;">

        <!-- Header -->
        <tr><td style="background:${accent};border-radius:12px 12px 0 0;padding:28px 36px;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td>
                <table cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="background:rgba(255,255,255,0.2);border-radius:8px;width:36px;height:36px;text-align:center;vertical-align:middle;">
                      <span style="color:#fff;font-size:20px;font-weight:800;line-height:36px;">+</span>
                    </td>
                    <td style="padding-left:10px;color:#fff;font-size:1.1rem;font-weight:800;letter-spacing:-0.3px;vertical-align:middle;">CuraLog</td>
                  </tr>
                </table>
              </td>
              <td align="right" style="color:rgba(255,255,255,0.7);font-size:0.78rem;vertical-align:middle;">${opts.title}</td>
            </tr>
          </table>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#ffffff;padding:36px 36px 28px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
          ${opts.body}
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f9fafb;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:20px 36px;text-align:center;">
          <p style="margin:0;font-size:0.72rem;color:#9ca3af;line-height:1.6;">
            CuraLog by <strong style="color:#6b7280;">DataPrimeTech</strong> &middot; Care Coordination Platform<br>
            Questions? Contact your care team through the CuraLog portal.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ── OTP / Verification email ───────────────────────────────────────────────────
export function otpEmailHtml(name: string, code: string) {
  return emailLayout({
    title: 'Verification Code',
    preheader: `Your CuraLog verification code is ${code}`,
    body: `
      <p style="margin:0 0 6px;font-size:1rem;font-weight:700;color:#111827;">Hi ${name},</p>
      <p style="margin:0 0 28px;font-size:0.875rem;color:#6b7280;line-height:1.6;">Use the code below to verify your identity. It expires in <strong>10 minutes</strong>.</p>

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:28px;text-align:center;margin-bottom:28px;">
        <p style="margin:0 0 8px;font-size:0.75rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;">Your verification code</p>
        <p style="margin:0;font-size:2.4rem;font-weight:800;letter-spacing:0.3em;color:#0d9488;font-variant-numeric:tabular-nums;">${code}</p>
      </div>

      <p style="margin:0;font-size:0.8rem;color:#9ca3af;line-height:1.6;">
        If you didn't request this code, you can safely ignore this email. Never share your verification code with anyone.
      </p>
    `,
  })
}

// ── Refill status email ────────────────────────────────────────────────────────
const PATIENT_MSG: Record<string, string> = {
  pending:               'Your refill request has been received.',
  sent_to_prescriber:    'Your refill request has been sent to your prescriber.',
  submitted:             'Your refill request has been submitted.',
  at_prescriber:         'Your prescriber is reviewing your refill request.',
  prescriber_approved:   'Great news — your prescriber approved the refill. It\'s being sent to your pharmacy.',
  prescriber_denied:     'Your prescriber was unable to approve this refill. Please contact your care team.',
  sent_to_pharmacy:      'Your prescription has been sent to the pharmacy.',
  at_pharmacy:           'Your pharmacy has received the prescription and is processing it.',
  prior_auth_required:   'Your insurance requires prior authorization. We\'re working on it.',
  prior_auth_submitted:  'Prior authorization has been submitted to your insurance. We\'ll update you when we hear back.',
  prior_auth_approved:   'Prior authorization approved! Your pharmacy will now fill the prescription.',
  prior_auth_denied:     'Prior authorization was denied. Please contact your care team for next steps.',
  too_soon:              'It\'s too early to refill based on your insurance plan. We\'ll try again when eligible.',
  insurance_issue:       'There\'s an issue with your insurance coverage. We\'re working to resolve it.',
  delay:                 'There\'s a delay with your refill. We\'re working to resolve it.',
  ready:                 'Your prescription is ready for pickup!',
  picked_up:             'Your prescription has been picked up. Take care!',
  denied:                'This refill request was not approved. Please contact your care team.',
  cancelled:             'This refill request has been cancelled.',
}

export function refillEmailHtml(
  title: string,
  patientName: string,
  medName: string,
  status: string,
  note: string | null,
  appUrl: string
) {
  const msg = PATIENT_MSG[status] || status.replace(/_/g, ' ')
  const isReady    = status === 'ready'
  const isDenied   = ['denied', 'prescriber_denied', 'prior_auth_denied'].includes(status)
  const isPositive = ['prescriber_approved', 'prior_auth_approved', 'ready', 'picked_up'].includes(status)

  const accent       = isReady ? '#059669' : isDenied ? '#dc2626' : '#0d9488'
  const boxBg        = isPositive ? '#f0fdf4' : isDenied ? '#fef2f2' : '#f8fafc'
  const boxBorder    = isPositive ? '#bbf7d0' : isDenied ? '#fecaca' : '#e5e7eb'
  const boxTextColor = isPositive ? '#065f46' : isDenied ? '#991b1b' : '#374151'

  const statusLabel = status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  return emailLayout({
    title,
    preheader: `Update on your ${medName} refill — ${statusLabel}`,
    accentColor: accent,
    body: `
      <p style="margin:0 0 6px;font-size:1rem;font-weight:700;color:#111827;">Hi ${patientName},</p>
      <p style="margin:0 0 24px;font-size:0.875rem;color:#6b7280;line-height:1.6;">
        Here's an update on your refill request for <strong style="color:#111827;">${medName}</strong>.
      </p>

      <div style="background:${boxBg};border:1px solid ${boxBorder};border-radius:12px;padding:20px 24px;margin-bottom:24px;">
        <p style="margin:0 0 4px;font-size:0.7rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#9ca3af;">Status</p>
        <p style="margin:0 0 10px;font-size:1rem;font-weight:700;color:${boxTextColor};">${statusLabel}</p>
        <p style="margin:0;font-size:0.875rem;color:#4b5563;line-height:1.6;">${msg}</p>
        ${note ? `<div style="margin-top:14px;padding-top:14px;border-top:1px solid ${boxBorder};font-size:0.8rem;color:#6b7280;line-height:1.6;"><strong style="color:#374151;">Note from your care team:</strong> ${note}</div>` : ''}
      </div>

      <p style="margin:0;font-size:0.8rem;color:#9ca3af;line-height:1.6;">
        Log in to your patient portal to see the full history of this refill request.
      </p>
    `,
  })
}

// ── Invoice email ──────────────────────────────────────────────────────────────
export function invoiceEmailHtml(opts: {
  senderName: string
  recipientName: string
  items: { name: string; date: Date | string; amount: number }[]
  total: number
  note: string | null
  dueDate: string | null
}) {
  const { senderName, recipientName, items, total, note, dueDate } = opts
  const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  const fmtDate = (d: Date | string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const invoiceDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const invoiceNum = `INV-${Date.now().toString().slice(-6)}`

  const rows = items.map((item, i) => `
    <tr style="background:${i % 2 === 0 ? '#ffffff' : '#f9fafb'};">
      <td style="padding:12px 16px;font-size:.875rem;color:#111827;border-bottom:1px solid #f3f4f6;">${item.name}</td>
      <td style="padding:12px 16px;font-size:.8rem;color:#6b7280;border-bottom:1px solid #f3f4f6;text-align:center;white-space:nowrap;">${fmtDate(item.date)}</td>
      <td style="padding:12px 16px;font-size:.875rem;font-weight:700;color:#111827;border-bottom:1px solid #f3f4f6;text-align:right;white-space:nowrap;">${fmt(item.amount)}</td>
    </tr>
  `).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>Invoice from ${senderName}</title>
</head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${senderName} sent you an invoice for ${fmt(total)} — ${invoiceNum}&nbsp;‌&nbsp;‌&nbsp;‌</div>

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f0f2f5;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;">

        <!-- Logo bar -->
        <tr><td style="padding-bottom:24px;" align="center">
          <table cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <!-- Icon mark: dark navy box with rising bars -->
              <td style="background:#1a1a2e;border-radius:10px;width:42px;height:42px;vertical-align:bottom;padding:7px 8px 6px;">
                <table cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:separate;border-spacing:2px 0;">
                  <tr style="vertical-align:bottom;">
                    <td style="width:7px;height:10px;background:#4F6EF7;border-radius:2px 2px 0 0;opacity:.45;vertical-align:bottom;font-size:0;line-height:0;">&nbsp;</td>
                    <td style="width:7px;height:17px;background:#4F6EF7;border-radius:2px 2px 0 0;opacity:.72;vertical-align:bottom;font-size:0;line-height:0;">&nbsp;</td>
                    <td style="width:7px;height:24px;background:#4F6EF7;border-radius:2px 2px 0 0;vertical-align:bottom;font-size:0;line-height:0;">&nbsp;</td>
                  </tr>
                </table>
              </td>
              <!-- Wordmark -->
              <td style="padding-left:11px;vertical-align:middle;">
                <div style="font-size:1.05rem;font-weight:900;color:#1a1a2e;letter-spacing:-0.4px;line-height:1.15;">DataPrimeTech</div>
                <div style="font-size:.62rem;font-weight:700;color:#4F6EF7;letter-spacing:.1em;text-transform:uppercase;margin-top:2px;">Finance Tracker</div>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Main card -->
        <tr><td style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">

          <!-- Invoice header band -->
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);padding:32px 36px 28px;">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="vertical-align:top;">
                      <div style="font-size:.65rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.5);margin-bottom:6px;">Invoice</div>
                      <div style="font-size:1.9rem;font-weight:900;color:#ffffff;letter-spacing:-1px;line-height:1;">${invoiceNum}</div>
                      <div style="font-size:.78rem;color:rgba(255,255,255,.55);margin-top:8px;">Issued ${invoiceDate}</div>
                    </td>
                    <td style="vertical-align:top;text-align:right;">
                      <div style="background:rgba(79,110,247,.25);border:1px solid rgba(79,110,247,.5);border-radius:20px;display:inline-block;padding:5px 14px;margin-bottom:12px;">
                        <span style="font-size:.72rem;font-weight:700;color:#a5b4fc;letter-spacing:.04em;">PAYMENT DUE</span>
                      </div>
                      <div style="font-size:1.6rem;font-weight:900;color:#ffffff;">${fmt(total)}</div>
                      ${dueDate ? `<div style="font-size:.78rem;color:rgba(255,255,255,.55);margin-top:4px;">by ${fmtDate(dueDate)}</div>` : ''}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- FROM / TO row -->
            <tr>
              <td style="padding:0;">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td width="50%" style="padding:20px 36px;border-bottom:2px solid #f3f4f6;border-right:1px solid #f3f4f6;">
                      <div style="font-size:.62rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#9ca3af;margin-bottom:6px;">From</div>
                      <div style="font-size:.95rem;font-weight:700;color:#111827;">${senderName}</div>
                      <div style="font-size:.75rem;color:#6b7280;margin-top:2px;">via DataPrimeTech Finance</div>
                    </td>
                    <td width="50%" style="padding:20px 36px;border-bottom:2px solid #f3f4f6;">
                      <div style="font-size:.62rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#9ca3af;margin-bottom:6px;">Bill To</div>
                      <div style="font-size:.95rem;font-weight:700;color:#111827;">${recipientName}</div>
                      <div style="font-size:.75rem;color:#6b7280;margin-top:2px;">${items.length} item${items.length !== 1 ? 's' : ''} · shared expenses</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Items table -->
            <tr><td style="padding:0 36px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <thead>
                  <tr style="background:#f8fafc;">
                    <th style="padding:10px 16px;text-align:left;font-size:.68rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#9ca3af;border-bottom:2px solid #e5e7eb;">Description</th>
                    <th style="padding:10px 16px;text-align:center;font-size:.68rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#9ca3af;border-bottom:2px solid #e5e7eb;">Date</th>
                    <th style="padding:10px 16px;text-align:right;font-size:.68rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#9ca3af;border-bottom:2px solid #e5e7eb;">Amount</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>
            </td></tr>

            <!-- Total row -->
            <tr><td style="padding:0 36px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td colspan="2" style="padding:16px 16px;border-top:2px solid #e5e7eb;text-align:right;">
                    <span style="font-size:.75rem;font-weight:600;color:#6b7280;margin-right:24px;text-transform:uppercase;letter-spacing:.05em;">Total Due</span>
                    <span style="font-size:1.4rem;font-weight:900;color:#4F6EF7;">${fmt(total)}</span>
                  </td>
                </tr>
              </table>
            </td></tr>

            ${dueDate ? `
            <!-- Due date callout -->
            <tr><td style="padding:0 36px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr><td style="background:#eff2ff;border:1px solid #c7d2fe;border-radius:10px;padding:14px 20px;">
                  <table cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td style="vertical-align:middle;padding-right:10px;">
                        <div style="width:32px;height:32px;background:#4F6EF7;border-radius:8px;text-align:center;line-height:32px;font-size:16px;">📅</div>
                      </td>
                      <td>
                        <div style="font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#4338ca;">Payment Due</div>
                        <div style="font-size:.95rem;font-weight:700;color:#1e1b4b;margin-top:2px;">${fmtDate(dueDate)}</div>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>
            </td></tr>` : ''}

            ${note ? `
            <!-- Note -->
            <tr><td style="padding:0 36px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr><td style="background:#fefce8;border-left:4px solid #f59e0b;border-radius:0 8px 8px 0;padding:14px 18px;">
                  <div style="font-size:.68rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#92400e;margin-bottom:5px;">Note from ${senderName}</div>
                  <div style="font-size:.875rem;color:#78350f;line-height:1.65;">${note}</div>
                </td></tr>
              </table>
            </td></tr>` : ''}

          </table>

          <!-- Card footer -->
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr><td style="background:#f8fafc;border-top:1px solid #e5e7eb;padding:20px 36px;text-align:center;">
              <p style="margin:0;font-size:.78rem;color:#6b7280;line-height:1.6;">
                Questions about this invoice? Reply to <strong style="color:#374151;">${senderName}</strong> directly.
              </p>
              <p style="margin:8px 0 0;font-size:.7rem;color:#9ca3af;">
                Sent via <strong style="color:#6b7280;">DataPrimeTech Finance Tracker</strong>
              </p>
            </td></tr>
          </table>

        </td></tr>

        <!-- Outer footer -->
        <tr><td style="padding-top:24px;text-align:center;">
          <table cellpadding="0" cellspacing="0" role="presentation" align="center">
            <tr>
              <td style="background:#1a1a2e;border-radius:6px;width:26px;height:26px;vertical-align:bottom;padding:4px 5px 3px;">
                <table cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:separate;border-spacing:1px 0;">
                  <tr style="vertical-align:bottom;">
                    <td style="width:4px;height:6px;background:#4F6EF7;border-radius:1px 1px 0 0;opacity:.5;vertical-align:bottom;font-size:0;line-height:0;">&nbsp;</td>
                    <td style="width:4px;height:10px;background:#4F6EF7;border-radius:1px 1px 0 0;opacity:.75;vertical-align:bottom;font-size:0;line-height:0;">&nbsp;</td>
                    <td style="width:4px;height:14px;background:#4F6EF7;border-radius:1px 1px 0 0;vertical-align:bottom;font-size:0;line-height:0;">&nbsp;</td>
                  </tr>
                </table>
              </td>
              <td style="padding-left:8px;font-size:.8rem;font-weight:800;color:#1a1a2e;vertical-align:middle;letter-spacing:-.3px;">DataPrimeTech</td>
            </tr>
          </table>
          <p style="margin:8px 0 0;font-size:.7rem;color:#9ca3af;">This is a personal finance invoice, not a legal document.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ── Refill reminder email ──────────────────────────────────────────────────────
export function refillReminderHtml(opts: {
  patientName: string
  medName: string
  daysLeft: number | null
  dosage?: string
  instructions?: string
  ownerName: string
}) {
  const { patientName, medName, daysLeft, dosage, instructions, ownerName } = opts
  const isUrgent = daysLeft !== null && daysLeft <= 7
  const daysLabel = daysLeft !== null ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''}` : null

  return emailLayout({
    title: 'Refill Reminder',
    preheader: `${patientName}, your ${medName} refill is coming up${daysLabel ? ` — ${daysLabel} remaining` : ''}.`,
    accentColor: isUrgent ? '#dc2626' : '#0d9488',
    body: `
      <p style="margin:0 0 6px;font-size:1rem;font-weight:700;color:#111827;">Hi ${patientName},</p>
      <p style="margin:0 0 24px;font-size:0.875rem;color:#6b7280;line-height:1.6;">
        This is a friendly reminder about an upcoming medication refill.
      </p>

      <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
        <p style="margin:0 0 2px;font-size:0.7rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#9ca3af;">Medication</p>
        <p style="margin:0 0 12px;font-size:1.05rem;font-weight:700;color:#111827;">${medName}</p>
        ${dosage ? `<p style="margin:0 0 4px;font-size:0.82rem;color:#4b5563;">Dosage: <strong>${dosage}</strong></p>` : ''}
        ${instructions ? `<p style="margin:0 0 12px;font-size:0.8rem;color:#6b7280;">${instructions}</p>` : ''}
        ${daysLabel ? `
        <div style="display:inline-block;background:${isUrgent ? '#fef2f2' : '#fef9c3'};border:1px solid ${isUrgent ? '#fecaca' : '#fde68a'};border-radius:20px;padding:4px 14px;margin-top:4px;">
          <span style="font-size:0.8rem;font-weight:700;color:${isUrgent ? '#dc2626' : '#92400e'};">${daysLabel} of supply remaining</span>
        </div>` : ''}
      </div>

      <p style="margin:0 0 20px;font-size:0.875rem;color:#4b5563;line-height:1.6;">
        Please contact your pharmacy or provider to request a refill before you run out.
      </p>
      <p style="margin:0;font-size:0.8rem;color:#9ca3af;">— ${ownerName} via CuraLog</p>
    `,
  })
}
