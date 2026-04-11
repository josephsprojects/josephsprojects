export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireOwner, createAuditLog } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { z } from 'zod'
import type { ApiResponse } from '@/types'

const CreateWorkspaceSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['family','clinical','assisted_living','home_health','specialty']).default('family'),
  description: z.string().optional(),
  timezone: z.string().default('America/New_York'),
})

export async function GET() {
  const user = await requireOwner()
  const workspaces = await prisma.workspace.findMany({
    orderBy: { created_at: 'desc' },
    include: { _count: { select: { patients: true, members: true } } }
  })
  return NextResponse.json<ApiResponse>({ success: true, data: workspaces })
}

export async function POST(req: NextRequest) {
  const user = await requireOwner()
  const body = await req.json()
  const parsed = CreateWorkspaceSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json<ApiResponse>({ success: false, message: 'Invalid data', error: parsed.error.message }, { status: 400 })
  }

  const cookieStore = await cookies()
  const isTestMode = cookieStore.get('curalog_test_mode')?.value === '1'
  const ws = await prisma.workspace.create({
    data: { ...parsed.data, is_test: isTestMode },
    include: { _count: { select: { patients: true, members: true } } },
  })

  await createAuditLog({
    userId: user.id, userName: user.name,
    workspaceId: ws.id, action: 'create',
    entityType: 'workspace', entityName: ws.name,
  })

  return NextResponse.json<ApiResponse>({ success: true, data: ws }, { status: 201 })
}
