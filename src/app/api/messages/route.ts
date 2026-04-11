export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createAuditLog } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const SendMessageSchema = z.object({
  workspace_id:  z.string().min(1),
  recipient_id:  z.string().optional().nullable(),
  subject:       z.string().optional().nullable(),
  body:          z.string().min(1),
})

export async function PATCH(req: NextRequest) {
  // Mark messages as read
  const user = await requireAuth()
  const { ids } = await req.json()
  if (!Array.isArray(ids)) return NextResponse.json({ success: false }, { status: 400 })
  await prisma.message.updateMany({
    where: { id: { in: ids }, recipient_id: user.id },
    data: { status: 'read' },
  })
  return NextResponse.json({ success: true })
}

export async function POST(req: NextRequest) {
  const user = await requireAuth()
  const body = await req.json()
  const parsed = SendMessageSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: 'Invalid data', error: parsed.error.message }, { status: 400 })
  }

  const message = await prisma.message.create({
    data: {
      workspace_id: parsed.data.workspace_id,
      sender_id:    user.id,
      recipient_id: parsed.data.recipient_id || null,
      subject:      parsed.data.subject || null,
      body:         parsed.data.body,
      status:       'unread',
    },
    include: {
      sender:    { select: { name: true } },
      recipient: { select: { name: true } },
    },
  })

  await createAuditLog({
    userId: user.id, userName: user.name,
    workspaceId: parsed.data.workspace_id, action: 'create',
    entityType: 'message',
    entityName: parsed.data.subject || 'Message',
  })

  return NextResponse.json({ success: true, data: message }, { status: 201 })
}
