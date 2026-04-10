import { requireOwner } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

function StatCard({ label, value, sub, color = 'var(--teal)' }: { label: string; value: number | string; sub?: string; color?: string }) {
  return (
    <div className="stat-crd">
      <div className="stat-label">{label}</div>
      <div className="stat-val" style={{ color }}>{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  )
}

export const metadata = { title: 'Dashboard' }

export default async function OwnerDashboard() {
  const user = await requireOwner()

  const [totalWs, totalPts, activeMeds, pendingRR, unreadNotifs, urgentMeds, recentAudit] = await Promise.all([
    prisma.workspace.count({ where: { status: 'active' } }),
    prisma.patient.count({ where: { status: 'active' } }),
    prisma.medication.count({ where: { status: 'active' } }),
    prisma.refillRequest.count({ where: { status: { in: ['pending', 'submitted'] } } }),
    prisma.notification.count({ where: { status: 'unread' } }),
    prisma.medication.count({ where: { status: 'active', days_supply: { lte: 7 } } }),
    prisma.auditLog.findMany({ orderBy: { created_at: 'desc' }, take: 6 }),
  ])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const isBlank = totalWs === 0

  return (
    <div className="pg-inner">
      <div className="pg-hd">
        <h2>{greeting}, {user.name.split(' ')[0]}</h2>
        <p>Platform overview · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
      </div>

      {/* Onboarding checklist when blank */}
      {isBlank && (
        <div className="crd" style={{ marginBottom: 24, borderLeft: '4px solid var(--teal)' }}>
          <div className="crd-h">Getting started</div>
          <p style={{ fontSize: '.875rem', color: 'var(--text2)', marginBottom: 16 }}>
            Welcome to CuraLog. Your platform is ready — complete these steps to get started.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { step: 1, label: 'Create your first workspace', href: '/owner/workspaces', done: totalWs > 0 },
              { step: 2, label: 'Add a patient', href: '/owner/patients', done: totalPts > 0 },
              { step: 3, label: 'Add a medication', href: '/owner/medications', done: activeMeds > 0 },
            ].map(({ step, label, href, done }) => (
              <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: done ? 'var(--green)' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {done
                    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                    : <span style={{ fontSize: '.7rem', fontWeight: 700, color: 'var(--text3)' }}>{step}</span>
                  }
                </div>
                <span style={{ fontSize: '.875rem', color: done ? 'var(--text3)' : 'var(--text)', textDecoration: done ? 'line-through' : 'none', flex: 1 }}>{label}</span>
                {!done && <Link href={href} className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '.8rem' }}>Start →</Link>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        <StatCard label="Workspaces" value={totalWs} sub="active" />
        <StatCard label="Patients" value={totalPts} sub="active" />
        <StatCard label="Active Meds" value={activeMeds} />
        <StatCard label="Pending Refills" value={pendingRR} color={pendingRR > 0 ? 'var(--amber)' : undefined} sub={pendingRR > 0 ? 'need attention' : 'all clear'} />
        <StatCard label="Notifications" value={unreadNotifs} color={unreadNotifs > 0 ? 'var(--blue)' : undefined} sub="unread" />
        {urgentMeds > 0 && <StatCard label="Urgent" value={urgentMeds} color="var(--red)" sub="≤7 days supply" />}
      </div>

      {/* Quick actions */}
      <div className="crd" style={{ marginBottom: 20 }}>
        <div className="crd-h">Quick actions</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link href="/owner/workspaces?new=1" className="btn btn-primary">+ New workspace</Link>
          <Link href="/owner/patients?new=1" className="btn btn-secondary">+ Add patient</Link>
          <Link href="/owner/medications?new=1" className="btn btn-secondary">+ Add medication</Link>
          <Link href="/owner/requests" className="btn btn-secondary">View refill requests</Link>
        </div>
      </div>

      {/* Recent audit log */}
      {recentAudit.length > 0 && (
        <div className="crd">
          <div className="crd-h" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Recent activity
            <Link href="/owner/audit" style={{ fontSize: '.75rem', color: 'var(--teal)', fontWeight: 600 }}>View all →</Link>
          </div>
          <table className="tbl">
            <thead>
              <tr><th>User</th><th>Action</th><th>Entity</th><th>When</th></tr>
            </thead>
            <tbody>
              {recentAudit.map((log: any) => (
                <tr key={log.id}>
                  <td style={{ fontWeight: 600 }}>{log.user_name || '—'}</td>
                  <td><span className={`badge badge-${log.action === 'create' ? 'teal' : log.action === 'delete' ? 'red' : 'gray'}`}>{log.action}</span></td>
                  <td style={{ color: 'var(--text2)' }}>{log.entity_type} · {log.entity_name}</td>
                  <td style={{ color: 'var(--text3)', fontSize: '.8rem' }}>{new Date(log.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
