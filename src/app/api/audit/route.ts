import { NextRequest, NextResponse } from 'next/server'
import { requireOwner } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { ApiResponse } from '@/types'

export async function GET(req: NextRequest) {
  await requireOwner()
  const p = req.nextUrl.searchParams

  const logs = await prisma.auditLog.findMany({
    where: {
      workspace_id: p.get('workspace_id') || undefined,
      entity_type: p.get('entity_type') || undefined,
      action: (p.get('action') as any) || undefined,
    },
    orderBy: { created_at: 'desc' },
    take: parseInt(p.get('limit') || '100'),
    skip: parseInt(p.get('offset') || '0'),
  })

  return NextResponse.json<ApiResponse>({ success: true, data: logs })
}
