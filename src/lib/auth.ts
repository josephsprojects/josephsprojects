import { createServerClient } from './supabase/server'
import { prisma } from './prisma'
import { redirect } from 'next/navigation'
import type { AuthUser, Role } from '@/types'

/** Get the current authenticated user with their DB role. Returns null if not logged in. */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const dbUser = await prisma.user.findUnique({
    where: { supabase_id: user.id },
    select: { id: true, supabase_id: true, email: true, name: true, role: true, initials: true, color: true }
  })

  return dbUser as AuthUser | null
}

/** Require auth — redirects to /login if not authenticated */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  return user
}

/** Require platform_owner role — redirects if not owner */
export async function requireOwner(): Promise<AuthUser> {
  const user = await requireAuth()
  if (user.role !== 'platform_owner') redirect('/login?error=unauthorized')
  return user
}

/** Require a specific role or above */
export async function requireRole(allowedRoles: Role[]): Promise<AuthUser> {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role)) redirect('/login?error=unauthorized')
  return user
}

/** Check if the current user is the platform owner (server-side) */
export async function isOwner(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === 'platform_owner' && user?.email === process.env.OWNER_EMAIL
}

/** Create audit log entry */
export async function createAuditLog(params: {
  userId?: string
  userName?: string
  workspaceId?: string
  action: string
  entityType: string
  entityName?: string
  field?: string
  fromValue?: string
  toValue?: string
  ipAddress?: string
}) {
  try {
    await prisma.auditLog.create({
      data: {
        user_id: params.userId,
        user_name: params.userName,
        workspace_id: params.workspaceId,
        action: params.action as any,
        entity_type: params.entityType,
        entity_name: params.entityName,
        field: params.field,
        from_value: params.fromValue,
        to_value: params.toValue,
        ip_address: params.ipAddress,
      }
    })
  } catch (e) {
    console.error('Failed to create audit log:', e)
  }
}
