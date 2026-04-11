export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendSMS, formatPhone } from '@/lib/twilio'
import { sendEmail } from '@/lib/sendgrid'
import type { ApiResponse } from '@/types'

// POST /api/notifications/test
// Body: { channel: 'sms' | 'email' | 'both' }
export async function POST(req: NextRequest) {
  const user = await requireAuth()
  const { channel } = await req.json()

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true, email: true, phone: true },
  })

  if (!profile) return NextResponse.json<ApiResponse>({ success: false, message: 'User not found' }, { status: 404 })

  const errors: string[] = []

  if (channel === 'sms' || channel === 'both') {
    if (!profile.phone) {
      errors.push('No phone number on file — add one in Account settings first.')
    } else {
      try {
        await sendSMS(
          formatPhone(profile.phone),
          `CuraLog test message — Hi ${profile.name}! Your SMS notifications are working. You'll receive refill reminders and patient alerts here.`
        )
      } catch (e: any) {
        errors.push(`SMS failed: ${e.message}`)
      }
    }
  }

  if (channel === 'email' || channel === 'both') {
    if (!profile.email) {
      errors.push('No email address on file.')
    } else {
      try {
        await sendEmail({
          to: profile.email,
          subject: 'CuraLog — Test notification',
          html: `
            <div style="font-family:-apple-system,sans-serif;max-width:480px;margin:32px auto;background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden">
              <div style="background:#0d9488;color:#fff;padding:24px 28px">
                <div style="font-weight:800;font-size:1.1rem">CuraLog</div>
                <div style="font-size:.85rem;opacity:.85;margin-top:2px">Test Notification</div>
              </div>
              <div style="padding:28px">
                <p style="color:#111827;font-weight:600;font-size:1rem;margin:0 0 12px">Hi ${profile.name}!</p>
                <p style="color:#4b5563;font-size:.9rem;margin:0 0 16px">Your email notifications are working correctly. You'll receive refill reminders, patient alerts, and provider communication through this address.</p>
                <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px 16px;margin-bottom:16px">
                  <div style="font-size:.8rem;color:#065f46;font-weight:600">What you'll receive here:</div>
                  <ul style="margin:8px 0 0;padding-left:18px;color:#374151;font-size:.83rem;line-height:1.7">
                    <li>Medication refill reminders</li>
                    <li>Patient SMS reply notifications (YES/NO)</li>
                    <li>Low supply alerts</li>
                    <li>Provider contact confirmations</li>
                  </ul>
                </div>
                <p style="color:#9ca3af;font-size:.75rem;margin:0">Sent from CuraLog · ${new Date().toLocaleString()}</p>
              </div>
            </div>`,
        })
      } catch (e: any) {
        errors.push(`Email failed: ${e.message}`)
      }
    }
  }

  if (errors.length > 0) {
    return NextResponse.json<ApiResponse>({ success: false, message: errors.join(' ') }, { status: 400 })
  }

  return NextResponse.json<ApiResponse>({ success: true, message: 'Test notification sent!' })
}
