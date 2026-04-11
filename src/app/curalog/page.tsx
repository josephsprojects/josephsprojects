import Link from 'next/link'

export const metadata = { title: 'CuraLog — Care Coordination' }

export default function CuraLogPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', display: 'flex', flexDirection: 'column' }}>
      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', borderBottom: '1px solid var(--border)', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M8 2v4M8 10v4M2 8h4M10 8h4"/></svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text1)' }}>CuraLog</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/login" className="btn btn-secondary" style={{ fontSize: '.875rem' }}>Sign in</Link>
          <Link href="/signup" className="btn btn-primary" style={{ fontSize: '.875rem' }}>Create account</Link>
        </div>
      </nav>

      {/* Hero */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 640 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--teal-light)', border: '1px solid rgba(14,79,84,.15)', borderRadius: 20, padding: '6px 14px', fontSize: '.78rem', fontWeight: 600, color: 'var(--teal)', marginBottom: 28 }}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M8 2v4M8 10v4M2 8h4M10 8h4"/></svg>
            Built by DataPrimeTech
          </div>

          <h1 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 900, lineHeight: 1.1, color: 'var(--text1)', marginBottom: 20 }}>
            Care coordination,<br />
            <span style={{ color: 'var(--teal)' }}>done right.</span>
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--text2)', lineHeight: 1.6, marginBottom: 36 }}>
            CuraLog helps families and care teams track medications, manage refill requests, and stay connected with providers — all in one place.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" className="btn btn-primary" style={{ padding: '13px 28px', fontSize: '1rem' }}>
              Get started — it's free
            </Link>
            <Link href="/login" className="btn btn-secondary" style={{ padding: '13px 28px', fontSize: '1rem' }}>
              Sign in
            </Link>
          </div>
        </div>

        {/* Feature grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, maxWidth: 760, width: '100%', marginTop: 72 }}>
          {([
            {
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round"><path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="12" y1="9" x2="12" y2="15"/></svg>,
              title: 'Medication tracking',
              desc: 'Track every medication, dosage, and refill schedule across all your patients.',
            },
            {
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
              title: 'Refill reminders',
              desc: 'Automatic SMS and email reminders so no one misses a refill.',
            },
            {
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>,
              title: 'Patient portal',
              desc: 'Share read-only care summaries with family members and providers.',
            },
            {
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
              title: 'Secure & private',
              desc: 'Two-factor authentication and passkey support keep your data safe.',
            },
          ] as const).map(f => (
            <div key={f.title} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 18px', textAlign: 'left' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>{f.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '.9rem', marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: '.8rem', color: 'var(--text3)', lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </main>

      <footer style={{ padding: '20px 32px', borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: '.75rem', color: 'var(--text3)' }}>
        © {new Date().getFullYear()} DataPrimeTech · CuraLog
      </footer>
    </div>
  )
}
