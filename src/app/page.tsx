import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CuraLog — Care Coordination Platform',
  description: 'The care coordination platform for families, caregivers, and healthcare teams.',
}

const FEATURE_ICONS: Record<string, string> = {
  'Medication Management': 'M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18',
  'Refill Tracking': 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 10H2',
  'Provider Search': 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  'Pharmacy Locator': 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
  'Multi-Patient': 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
  'Audit Logs': 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  'Smart Notifications': 'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0',
  'Secure & Private': 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
}

const FEATURES = [
  { title: 'Medication Management', desc: 'Track prescriptions, OTC medications, supplements, and vitamins. Log actual doses, split pills, and custom schedules.' },
  { title: 'Refill Tracking', desc: 'Full pipeline from request to pickup. Submitted → At Prescriber → At Pharmacy → Ready → Picked Up.' },
  { title: 'Provider Search', desc: 'Search the live NPI Registry to find and save licensed doctors, specialists, nurses, and pharmacies.' },
  { title: 'Pharmacy Locator', desc: 'Find pharmacies by name, ZIP code, or city. Auto-fill pharmacy details directly into medication records.' },
  { title: 'Multi-Patient', desc: 'Manage medications for your entire family or patient panel from one dashboard. Separate workspaces per care context.' },
  { title: 'Audit Logs', desc: 'Every change is logged with who made it, what changed, and when. Full accountability for all platform actions.' },
  { title: 'Smart Notifications', desc: 'Get alerted when supplies are low, refills are due, or requests need attention. Configurable per medication.' },
  { title: 'Secure & Private', desc: 'Built on Supabase with row-level security. Your health data never leaves your control.' },
]

const ROLES = [
  { role: 'Workspace Owner', who: 'Practice admins', desc: 'Manages their workspace, patients, and team members. Controls who has access to their care environment.' },
  { role: 'Manager / Caregiver', who: 'Family caregivers, staff', desc: 'Manages assigned patients within their workspace. Adds medications, logs refills, tracks adherence.' },
  { role: 'Patient', who: 'Care recipients', desc: 'Views their own medication list and care details. Can submit requests and message their care team.' },
  { role: 'Provider', who: 'Doctors, nurses, pharmacists', desc: 'Views assigned patients and medication details relevant to their scope of care.' },
]

const INTEGRATIONS = [
  { name: 'Authentication', desc: 'Secure login & sessions', status: 'live' },
  { name: 'Database', desc: 'Encrypted cloud storage', status: 'live' },
  { name: 'NPI Registry', desc: 'Live provider search', status: 'live' },
  { name: 'Medication Database', desc: 'Drug name & dosage lookup', status: 'live' },
  { name: 'Email Notifications', desc: 'Refill reminders & alerts', status: 'live' },
  { name: 'SMS Reminders', desc: 'Text message alerts', status: 'configured' },
  { name: 'Document Storage', desc: 'Secure file vault', status: 'configured' },
  { name: 'Error Monitoring', desc: 'Uptime & reliability tracking', status: 'configured' },
]

function FeatureIcon({ path }: { path: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#0E4F54' }}>
      {path.split(' M ').map((p, i) => <path key={i} d={i === 0 ? p : 'M ' + p} />)}
    </svg>
  )
}

export default function HomePage() {
  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", color: '#0F172A', lineHeight: 1.6 }}>

      {/* Header */}
      <header style={{ position: 'sticky', top: 0, background: 'rgba(255,255,255,.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E2E8F0', zIndex: 100 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: '#0E4F54', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M8 2v4M8 10v4M2 8h4M10 8h4"/></svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>CuraLog</span>
          </div>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <a href="#features" style={{ padding: '6px 12px', fontSize: '.875rem', color: '#475569', fontWeight: 500 }}>Features</a>
            <a href="#roles" style={{ padding: '6px 12px', fontSize: '.875rem', color: '#475569', fontWeight: 500 }}>Roles</a>
            <a href="#integrations" style={{ padding: '6px 12px', fontSize: '.875rem', color: '#475569', fontWeight: 500 }}>Integrations</a>
            <a href="#about" style={{ padding: '6px 12px', fontSize: '.875rem', color: '#475569', fontWeight: 500 }}>About</a>
            <Link href="/login" style={{ marginLeft: 8, padding: '8px 20px', background: '#0E4F54', color: '#fff', borderRadius: 8, fontSize: '.875rem', fontWeight: 600, textDecoration: 'none' }}>Log In</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #0E4F54 0%, #0a3538 100%)', color: '#fff', padding: '96px 24px 88px', textAlign: 'center' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.12)', borderRadius: 20, padding: '5px 16px', fontSize: '.78rem', fontWeight: 700, marginBottom: 28, letterSpacing: '.04em', textTransform: 'uppercase' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', display: 'inline-block' }} />
            CuraLog · v1.0
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 900, lineHeight: 1.15, marginBottom: 20, letterSpacing: '-.02em' }}>
            Care coordination,<br />done right.
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.15rem)', opacity: .85, maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.75 }}>
            The medication management and care coordination platform for families, caregivers, and healthcare professionals.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/login" style={{ padding: '13px 32px', background: '#fff', color: '#0E4F54', borderRadius: 10, fontWeight: 700, fontSize: '1rem', textDecoration: 'none' }}>Get Started</Link>
            <a href="#features" style={{ padding: '13px 32px', border: '1.5px solid rgba(255,255,255,.35)', color: '#fff', borderRadius: 10, fontWeight: 600, fontSize: '1rem', textDecoration: 'none' }}>See features</a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '88px 24px', background: '#F0F4F8' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 10 }}>Everything you need to manage medications</h2>
            <p style={{ color: '#475569', fontSize: '1.05rem', maxWidth: 540, margin: '0 auto' }}>From prescription tracking to refill coordination — CuraLog handles the complexity so you can focus on care.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {FEATURES.map((f: any) => (
              <div key={f.title} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: '22px 24px' }}>
                <div style={{ width: 40, height: 40, background: '#E8F4F5', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0E4F54" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={FEATURE_ICONS[f.title]} />
                  </svg>
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 7 }}>{f.title}</h3>
                <p style={{ fontSize: '.875rem', color: '#475569', lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" style={{ padding: '88px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 10 }}>Role-based access for every member of the care team</h2>
            <p style={{ color: '#475569', fontSize: '1.05rem', maxWidth: 540, margin: '0 auto' }}>Every person gets exactly the access they need — no more, no less.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 760, margin: '0 auto' }}>
            {ROLES.map((r: any) => (
              <div key={r.role} style={{ display: 'flex', gap: 20, padding: '18px 24px', border: '1px solid #E2E8F0', borderRadius: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0E4F54', marginTop: 7, flexShrink: 0 }} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                    <span style={{ fontWeight: 700 }}>{r.role}</span>
                    <span style={{ fontSize: '.75rem', color: '#94A3B8', background: '#F1F5F9', padding: '2px 9px', borderRadius: 12 }}>{r.who}</span>
                  </div>
                  <p style={{ fontSize: '.875rem', color: '#475569', margin: 0 }}>{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section id="integrations" style={{ padding: '88px 24px', background: '#F0F4F8' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 10 }}>Built for reliability and security</h2>
            <p style={{ color: '#475569', fontSize: '1.05rem', maxWidth: 540, margin: '0 auto' }}>CuraLog is built on enterprise-grade infrastructure so your data is always safe, fast, and available.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
            {INTEGRATIONS.map((intg: any) => (
              <div key={intg.name} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, background: '#E8F4F5', borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0E4F54" strokeWidth="2" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '.875rem' }}>{intg.name}</div>
                  <div style={{ fontSize: '.75rem', color: '#94A3B8', marginTop: 1 }}>{intg.desc}</div>
                </div>
                <span style={{ marginLeft: 'auto', flexShrink: 0, fontSize: '.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: intg.status === 'live' ? 'rgba(26,122,66,.1)' : 'rgba(201,118,42,.1)', color: intg.status === 'live' ? '#1A7A42' : '#C9762A' }}>
                  {intg.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section style={{ padding: '88px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 14 }}>Security & Privacy</h2>
          <p style={{ color: '#475569', fontSize: '1.05rem', marginBottom: 36 }}>CuraLog is built with security as a foundation, not an afterthought.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, textAlign: 'left' }}>
            {[
              { title: 'Server-side auth', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', desc: 'All authentication and authorization is verified on the server. No client-side permission checks.' },
              { title: 'Row-level security', icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z', desc: 'Database-level access controls via Supabase RLS. Users can only access their own data.' },
              { title: 'Encrypted in transit', icon: 'M5 12h14M12 5l7 7-7 7', desc: 'All data is encrypted in transit via HTTPS/TLS. Passwords are managed by Supabase Auth.' },
              { title: 'Full audit trail', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', desc: 'Every action is logged with actor, timestamp, and before/after values. Nothing happens without a record.' },
            ].map((s: any) => (
              <div key={s.title} style={{ border: '1px solid #E2E8F0', borderRadius: 10, padding: '18px 20px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 36, height: 36, background: '#E8F4F5', borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0E4F54" strokeWidth="2" strokeLinecap="round">
                    <path d={s.icon} />
                  </svg>
                </div>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 5 }}>{s.title}</div>
                  <p style={{ fontSize: '.875rem', color: '#475569', margin: 0 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" style={{ padding: '88px 24px', background: '#0E4F54', color: '#fff' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 16 }}>About CuraLog</h2>
          <p style={{ opacity: .85, fontSize: '1.05rem', lineHeight: 1.8, marginBottom: 32 }}>
            CuraLog was designed to solve the fragmented, error-prone way that families and care teams manage medications.
            No single platform was simple enough for families, powerful enough for professionals, and integrated enough to actually work.
            CuraLog changes that.
          </p>
          <div style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 12, padding: '22px 28px', marginBottom: 32, display: 'inline-block' }}>
            <div style={{ fontSize: '.85rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', opacity: .6, marginBottom: 6 }}>Built by</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>DataPrimeTech</div>
          </div>
          <div style={{ display: 'block' }}>
            <Link href="/login" style={{ display: 'inline-block', padding: '13px 32px', background: '#fff', color: '#0E4F54', borderRadius: 10, fontWeight: 700, fontSize: '1rem', textDecoration: 'none' }}>
              Log In to CuraLog
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#0a3538', color: 'rgba(255,255,255,.5)', padding: '28px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 24, height: 24, background: 'rgba(255,255,255,.12)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M8 2v4M8 10v4M2 8h4M10 8h4"/></svg>
            </div>
            <span style={{ fontWeight: 700, color: '#fff' }}>CuraLog</span>
            <span style={{ fontSize: '.8rem' }}>© 2026 DataPrimeTech</span>
          </div>
          <div style={{ display: 'flex', gap: 20, fontSize: '.8rem', flexWrap: 'wrap' }}>
            {[['Log In', '/login'], ['About', '#about'], ['Features', '#features'], ['Contact', 'mailto:contact@dataprimetech.com'], ['Privacy', '/privacy'], ['Terms', '/terms']].map(([label, href]) => (
              <a key={label} href={href} style={{ color: 'rgba(255,255,255,.5)', textDecoration: 'none' }}>{label}</a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  )
}
