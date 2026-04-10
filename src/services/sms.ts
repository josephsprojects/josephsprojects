const TWILIO_API = 'https://api.twilio.com/2010-04-01/Accounts'

interface SendSMSParams {
  to: string
  body: string
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return `+${digits}`
}

export async function sendSMS(params: SendSMSParams): Promise<boolean> {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_PHONE_NUMBER

  if (!sid || !token || !from) {
    console.warn('Twilio env vars not set (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)')
    return false
  }

  const to = formatPhone(params.to)

  try {
    const body = new URLSearchParams({ From: from, To: to, Body: params.body })
    const r = await fetch(`${TWILIO_API}/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    })

    if (!r.ok) {
      const err = await r.json().catch(() => ({}))
      console.error('Twilio error:', err)
    }
    return r.ok
  } catch (e) {
    console.error('SMS send error:', e)
    return false
  }
}

// ── Message templates ────────────────────────────────────────────────────────

export function refillReadySMS(patientName: string, medName: string, pharmacyName?: string): string {
  const pharmacy = pharmacyName ? ` at ${pharmacyName}` : ''
  return `CuraLog: ${patientName}'s prescription for ${medName} is ready for pickup${pharmacy}. Reply STOP to opt out.`
}

export function refillSubmittedSMS(patientName: string, medName: string): string {
  return `CuraLog: A refill request for ${patientName}'s ${medName} has been submitted. We'll notify you when it's ready.`
}
