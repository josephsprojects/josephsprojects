'use client'

export default function OwnerError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif', maxWidth: 600 }}>
      <h2 style={{ color: '#b91c1c', marginBottom: 8 }}>Something went wrong</h2>
      <pre style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: 16, fontSize: '.8rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: '#991b1b' }}>
        {error.message}
        {error.digest ? `\n\nDigest: ${error.digest}` : ''}
      </pre>
      <button onClick={reset} style={{ marginTop: 16, padding: '8px 20px', background: '#0E4F54', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
        Try again
      </button>
    </div>
  )
}
