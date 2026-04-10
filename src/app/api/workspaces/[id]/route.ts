export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireOwner, createAuditLog } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import type { ApiResponse } from '@/types'

const UpdateWorkspaceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  timezone: z.string().optional(),
  status: z.enum(['active', 'inactive', 'archived']).optional(),
}).strict()

export async function PATCH(req: NextRequest) {
  const user = await requireOwner()
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json<ApiResponse>({ success: false, message: 'ID required' }, { status: 400 })

  const body = await req.json()
  const parsed = UpdateWorkspaceSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json<ApiResponse>({ success: false, message: 'Invalid data' }, { status: 400 })
  }

  const ws = await prisma.workspace.update({ where: { id }, data: parsed.data })

  await createAuditLog({
    userId: user.id, userName: user.name,
    workspaceId: id, action: 'update',
    entityType: 'workspace', entityName: ws.name,
  })

  return NextResponse.json<ApiResponse>({ success: true, data: ws })
}
