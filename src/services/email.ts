const RESEND_API = 'https://api.resend.com/emails'

interface SendEmailParams {
  to: string | string[]
  subject: string
  html: string
  from?: string
}

export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) { console.warn('RESEND_API_KEY not set'); return false }

  try {
    const r = await fetch(RESEND_API, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: params.from || process.env.RESEND_FROM || 'noreply@dataprimetech.com',
        to: Array.isArray(params.to) ? params.to : [params.to],
        subject: params.subject,
        html: params.html,
      })
    })
    return r.ok
  } catch (e) {
    console.error('Email send error:', e)
    return false
  }
}

export function refillReminderEmail(patientName: string, medName: string, daysLeft: number) {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <div style="background:#0E4F54;color:#fff;padding:16px 24px;border-radius:8px 8px 0 0">
        <strong>CuraLog</strong> · Refill Reminder
      </div>
      <div style="background:#f8f9fa;padding:24px;border-radius:0 0 8px 8px">
        <h2 style="color:#0E4F54;margin:0 0 12px">Refill Due Soon</h2>
        <p><strong>${patientName}</strong> has <strong>${daysLeft} day${daysLeft !== 1 ? 's' : ''}</strong> of <strong>${medName}</strong> remaining.</p>
        <p>Log in to CuraLog to submit a refill request or contact the pharmacy.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/owner" 
           style="display:inline-block;background:#0E4F54;color:#fff;padding:10px 24px;border-radius:6px;text-decoration:none;margin-top:8px">
          Open CuraLog
        </a>
      </div>
      <p style="font-size:11px;color:#999;margin-top:16px;text-align:center">
        © 2026 CuraLog · DataPrimeTech · DataPrimeTech
      </p>
    </div>
  `
}
