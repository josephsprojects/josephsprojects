'use client'
import { useState } from 'react'

interface Msg {
  id: string; sender_id: string; recipient_id?: string; subject?: string
  body: string; status: string; created_at: string
  sender?: { name: string }; recipient?: { name: string }
}
interface Member { id: string; name: string; email: string }
interface PatientMed { id: string; name: string; brand?: string | null; status: string; provider?: { id: string; name: string; phone?: string | null; fax?: string | null; email?: string | null; specialty?: string | null } | null }
interface PatientWithMeds { id: string; name: string; medications: PatientMed[] }

type ModalMode = 'compose' | 'provider' | null

export default function MessagesClient({
  initialMessages,
  currentUserId,
  workspaceId,
  members,
  patients,
}: {
  initialMessages: Msg[]
  currentUserId: string
  workspaceId: string
  members: Member[]
  patients: PatientWithMeds[]
}) {
  const [messages, setMessages]   = useState(initialMessages)
  const [modal, setModal]         = useState<ModalMode>(null)
  const [sending, setSending]     = useState(false)
  const [composeForm, setComposeForm] = useState({ recipient_id: '', subject: '', body: '' })
  const [composeErr, setComposeErr]   = useState('')

  // Provider contact state
  const [providerPatient,   setProviderPatient]   = useState(patients[0]?.id || '')
  const [selectedMedIds,    setSelectedMedIds]    = useState<Set<string>>(new Set())
  const [providerMsg,       setProviderMsg]       = useState('')
  const [channelTab,        setChannelTab]        = useState<'email' | 'fax' | 'phone'>('email')

  const unread = messages.filter(m => m.status === 'unread' && m.recipient_id === currentUserId).length

  // Get current patient's meds and derive unique providers
  const currentPatient = patients.find(p => p.id === providerPatient)
  const patientMeds    = currentPatient?.medications ?? []

  const providersMap = new Map<string, NonNullable<PatientMed['provider']>>()
  for (const med of patientMeds) {
    if (med.provider && !providersMap.has(med.provider.id)) {
      providersMap.set(med.provider.id, med.provider)
    }
  }
  const patientProviders = Array.from(providersMap.values())

  function openProvider() {
    setProviderPatient(patients[0]?.id || '')
    setSelectedMedIds(new Set())
    setProviderMsg('')
    setChannelTab('email')
    setModal('provider')
  }

  function onProviderPatientChange(pid: string) {
    setProviderPatient(pid)
    setSelectedMedIds(new Set())
  }

  function toggleMed(id: string) {
    setSelectedMedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function selectAllMeds() {
    if (selectedMedIds.size === patientMeds.length) {
      setSelectedMedIds(new Set())
    } else {
      setSelectedMedIds(new Set(patientMeds.map(m => m.id)))
    }
  }

  function buildRefillMessage(): string {
    const pt = currentPatient
    if (!pt) return providerMsg || ''
    const medList = patientMeds
      .filter(m => selectedMedIds.has(m.id))
      .map(m => `• ${m.brand || m.name}`)
      .join('\n')

    return [
      `Dear Provider,`,
      ``,
      `I am writing to request a refill for the following medication(s) for patient ${pt.name}:`,
      ``,
      medList || '(no medications selected)',
      ``,
      `Please process this refill request at your earliest convenience.`,
      ``,
      providerMsg ? `Additional notes: ${providerMsg}` : '',
      ``,
      `Thank you,`,
      `CuraLog Care Team`,
    ].filter((l, i, arr) => !(l === '' && arr[i - 1] === '')).join('\n').trim()
  }

  async function send(e: React.FormEvent) {
    e.preventDefault()
    if (!composeForm.body.trim()) { setComposeErr('Message body is required'); return }
    setSending(true); setComposeErr('')
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspace_id: workspaceId,
          recipient_id: composeForm.recipient_id || null,
          subject:      composeForm.subject.trim() || null,
          body:         composeForm.body.trim(),
        }),
      })
      const data = await res.json()
      if (!data.success) { setComposeErr(data.message || 'Failed to send'); setSending(false); return }
      setMessages(prev => [data.data, ...prev])
      setModal(null)
      setComposeForm({ recipient_id: '', subject: '', body: '' })
    } catch {
      setComposeErr('Network error — try again')
    }
    setSending(false)
  }

  async function markRead(id: string) {
    await fetch('/api/messages', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [id] }),
    })
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'read' } : m))
  }

  const CHANNEL_TAB_STYLE = (t: typeof channelTab) => ({
    padding: '6px 14px', fontSize: '.8rem', fontWeight: 600, border: 'none', cursor: 'pointer',
    background: 'none', color: channelTab === t ? 'var(--teal)' : 'var(--text3)',
    borderBottom: channelTab === t ? '2px solid var(--teal)' : '2px solid transparent',
    transition: 'all .15s',
  })

  return (
    <div className="pg-inner">
      <div className="pg-hd" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Messages</h2>
          <p>{unread > 0 ? `${unread} unread` : 'All caught up'}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={openProvider} disabled={patients.length === 0} title={patients.length === 0 ? 'Add a patient first' : ''}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ marginRight: 6 }}><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M8.5 3a4 4 0 100 8 4 4 0 000-8zM20 8v6M23 11h-6"/></svg>
            Contact Provider
          </button>
          <button className="btn btn-primary" onClick={() => { setComposeErr(''); setComposeForm({ recipient_id: '', subject: '', body: '' }); setModal('compose') }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Compose
          </button>
        </div>
      </div>

      <div className="crd" style={{ padding: 0 }}>
        {messages.length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            <h3>No messages yet</h3>
            <p>Compose a message to a team member, or use Contact Provider to reach a prescriber.</p>
            <button className="btn btn-primary" onClick={() => setModal('compose')}>Compose message</button>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine   = msg.sender_id === currentUserId
            const isUnread = msg.status === 'unread' && msg.recipient_id === currentUserId
            return (
              <div
                key={msg.id}
                style={{
                  padding: '14px 20px', borderBottom: '1px solid var(--border)',
                  display: 'flex', gap: 14, alignItems: 'flex-start',
                  background: isUnread ? 'rgba(14,79,84,.03)' : 'transparent',
                  cursor: isUnread ? 'pointer' : 'default',
                }}
                onClick={() => isUnread && markRead(msg.id)}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', background: isMine ? 'var(--teal)' : 'var(--surface2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isMine ? '#fff' : 'var(--text2)', fontSize: '.72rem', fontWeight: 700, flexShrink: 0,
                  border: isMine ? 'none' : '1px solid var(--border)',
                }}>
                  {(msg.sender?.name || 'S').split(' ').map((x: string) => x[0]).join('').slice(0,2).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontWeight: isUnread ? 700 : 500, fontSize: '.875rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                      {isMine
                        ? <span>To: <span style={{ color: 'var(--text2)' }}>{msg.recipient?.name || 'All members'}</span></span>
                        : <span>From: <span style={{ color: 'var(--text)' }}>{msg.sender?.name || 'Unknown'}</span></span>
                      }
                      {msg.subject && <span style={{ fontWeight: 400, color: 'var(--text3)' }}>— {msg.subject}</span>}
                      {isUnread && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--teal)', display: 'inline-block' }} />}
                    </div>
                    <span style={{ fontSize: '.72rem', color: 'var(--text3)', flexShrink: 0, marginLeft: 12 }}>
                      {new Date(msg.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '.85rem', color: 'var(--text2)', marginTop: 4, whiteSpace: 'pre-wrap' }}>{msg.body}</p>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ── Compose Modal ── */}
      {modal === 'compose' && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div className="modal-hd">
              <h3>New message</h3>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--text3)' }}>×</button>
            </div>
            <form onSubmit={send}>
              <div className="modal-body">
                {composeErr && (
                  <div style={{ color: 'var(--red)', fontSize: '.8rem', background: '#fef2f2', padding: '8px 12px', borderRadius: 6, marginBottom: 10 }}>{composeErr}</div>
                )}
                <div className="form-grp">
                  <label className="form-lbl">To</label>
                  <select className="form-inp" data-1p-ignore autoComplete="off" value={composeForm.recipient_id} onChange={e => setComposeForm(f => ({ ...f, recipient_id: e.target.value }))}>
                    <option value="">All team members (broadcast)</option>
                    {members.map(m => <option key={m.id} value={m.id}>{m.name} — {m.email}</option>)}
                  </select>
                </div>
                <div className="form-grp">
                  <label className="form-lbl">Subject <span style={{ color: 'var(--text3)', fontWeight: 400 }}>— optional</span></label>
                  <input className="form-inp" data-1p-ignore autoComplete="off" value={composeForm.subject} onChange={e => setComposeForm(f => ({ ...f, subject: e.target.value }))} />
                </div>
                <div className="form-grp">
                  <label className="form-lbl">Message</label>
                  <textarea className="form-inp" data-1p-ignore autoComplete="off" rows={5} value={composeForm.body} onChange={e => setComposeForm(f => ({ ...f, body: e.target.value }))} required />
                </div>
              </div>
              <div className="modal-ft">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={sending}>{sending ? 'Sending…' : 'Send message'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Contact Provider Modal ── */}
      {modal === 'provider' && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className="modal-hd">
              <h3>Contact Provider / APRN</h3>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--text3)' }}>×</button>
            </div>
            <div className="modal-body">
              {/* Patient picker */}
              <div className="form-grp">
                <label className="form-lbl">Patient</label>
                <select className="form-inp" data-1p-ignore autoComplete="off" value={providerPatient} onChange={e => onProviderPatientChange(e.target.value)}>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              {/* Medication checklist */}
              <div className="form-grp">
                <label className="form-lbl" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Medications to include in request</span>
                  {patientMeds.length > 0 && (
                    <button type="button" onClick={selectAllMeds} style={{ background: 'none', border: 'none', fontSize: '.75rem', color: 'var(--teal)', cursor: 'pointer', fontWeight: 600, padding: 0 }}>
                      {selectedMedIds.size === patientMeds.length ? 'Deselect all' : 'Select all'}
                    </button>
                  )}
                </label>
                {patientMeds.length === 0 ? (
                  <div style={{ padding: '10px 12px', fontSize: '.82rem', color: 'var(--text3)', background: 'var(--surface2)', borderRadius: 6, border: '1px solid var(--border)' }}>
                    No active medications on file for this patient.
                  </div>
                ) : (
                  <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                    {patientMeds.map((med, i) => (
                      <label key={med.id} style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', cursor: 'pointer',
                        borderBottom: i < patientMeds.length - 1 ? '1px solid var(--border)' : 'none',
                        background: selectedMedIds.has(med.id) ? 'rgba(13,148,136,.06)' : 'transparent',
                        transition: 'background .1s',
                      }}>
                        <input type="checkbox" checked={selectedMedIds.has(med.id)} onChange={() => toggleMed(med.id)} style={{ accentColor: 'var(--teal)', width: 14, height: 14, flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: '.875rem', fontWeight: selectedMedIds.has(med.id) ? 600 : 400 }}>{med.brand || med.name}</span>
                          {med.brand && med.brand !== med.name && <span style={{ fontSize: '.72rem', color: 'var(--text3)', marginLeft: 6 }}>{med.name}</span>}
                          {med.provider && <span style={{ fontSize: '.72rem', color: 'var(--teal)', marginLeft: 8 }}>· Rx: {med.provider.name}</span>}
                        </div>
                        <span className={`badge ${med.status === 'active' ? 'badge-teal' : 'badge-blue'}`} style={{ fontSize: '.65rem' }}>{med.status === 'active' ? 'Taking' : 'Prescribed'}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Provider contact info */}
              {patientProviders.length > 0 && (
                <div className="form-grp">
                  <label className="form-lbl">Prescriber(s) on file</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {patientProviders.map(pv => (
                      <div key={pv.id} style={{ padding: '10px 12px', background: 'var(--surface2)', borderRadius: 8, border: '1px solid var(--border)' }}>
                        <div style={{ fontWeight: 700, fontSize: '.875rem', marginBottom: 4 }}>{pv.name}{pv.specialty ? <span style={{ fontWeight: 400, color: 'var(--text3)', marginLeft: 6, fontSize: '.8rem' }}>{pv.specialty}</span> : null}</div>
                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: '.78rem', color: 'var(--text2)' }}>
                          {pv.phone && <span>Phone: <strong>{pv.phone}</strong></span>}
                          {pv.fax   && <span>Fax: <strong>{pv.fax}</strong></span>}
                          {pv.email && <span>Email: <strong>{pv.email}</strong></span>}
                          {!pv.phone && !pv.fax && !pv.email && <span style={{ color: 'var(--text3)' }}>No contact info on file</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional notes */}
              <div className="form-grp">
                <label className="form-lbl">Additional notes <span style={{ fontWeight: 400, color: 'var(--text3)' }}>— optional</span></label>
                <textarea className="form-inp" data-1p-ignore autoComplete="off" rows={2} value={providerMsg} onChange={e => setProviderMsg(e.target.value)} placeholder="Urgency, special instructions, patient notes…" />
              </div>

              {/* Channel tabs */}
              <div>
                <label className="form-lbl" style={{ marginBottom: 8, display: 'block' }}>Send via</label>
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 12 }}>
                  <button type="button" style={CHANNEL_TAB_STYLE('email')} onClick={() => setChannelTab('email')}>Email</button>
                  <button type="button" style={CHANNEL_TAB_STYLE('fax')}   onClick={() => setChannelTab('fax')}>Fax</button>
                  <button type="button" style={CHANNEL_TAB_STYLE('phone')} onClick={() => setChannelTab('phone')}>Phone</button>
                </div>

                {channelTab === 'email' && (
                  <div>
                    {patientProviders.some(p => p.email) ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {patientProviders.filter(p => p.email).map(pv => (
                          <a key={pv.id}
                            href={`mailto:${pv.email}?subject=Refill Request — ${currentPatient?.name ?? ''}&body=${encodeURIComponent(buildRefillMessage())}`}
                            className="btn btn-primary"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none', width: 'fit-content' }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 10l-10 7L2 10"/></svg>
                            Email {pv.name} — {pv.email}
                          </a>
                        ))}
                        <div style={{ fontSize: '.75rem', color: 'var(--text3)', marginTop: 4 }}>Opens your email client with the refill message pre-filled.</div>
                      </div>
                    ) : (
                      <div style={{ padding: '10px 12px', fontSize: '.82rem', color: 'var(--text3)', background: 'var(--surface2)', borderRadius: 6, border: '1px solid var(--border)' }}>
                        No email address on file for this patient's prescriber(s). Update provider details in the medication records.
                      </div>
                    )}
                  </div>
                )}

                {channelTab === 'fax' && (
                  <div>
                    {patientProviders.some(p => p.fax) ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {patientProviders.filter(p => p.fax).map(pv => (
                          <div key={pv.id} style={{ padding: '12px 14px', background: 'var(--surface2)', borderRadius: 8, border: '1px solid var(--border)' }}>
                            <div style={{ fontWeight: 700, fontSize: '.875rem', marginBottom: 6 }}>{pv.name}</div>
                            <div style={{ fontSize: '.82rem', color: 'var(--text2)', marginBottom: 10 }}>Fax: <strong style={{ fontSize: '1rem', color: 'var(--text)' }}>{pv.fax}</strong></div>
                            <div style={{ fontSize: '.75rem', color: 'var(--text3)', marginBottom: 10 }}>Copy the message below and send via your fax machine or efax service.</div>
                          </div>
                        ))}
                        <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px', background: 'var(--surface)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase' }}>Fax message</span>
                            <button type="button" className="btn btn-ghost" style={{ fontSize: '.7rem', padding: '2px 8px' }} onClick={() => navigator.clipboard?.writeText(buildRefillMessage())}>Copy</button>
                          </div>
                          <pre style={{ fontSize: '.8rem', color: 'var(--text2)', whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>{buildRefillMessage()}</pre>
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: '10px 12px', fontSize: '.82rem', color: 'var(--text3)', background: 'var(--surface2)', borderRadius: 6, border: '1px solid var(--border)' }}>
                        No fax number on file. Update the provider's fax number in the medication record.
                      </div>
                    )}
                  </div>
                )}

                {channelTab === 'phone' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {patientProviders.some(p => p.phone) ? patientProviders.filter(p => p.phone).map(pv => (
                      <div key={pv.id} style={{ padding: '12px 14px', background: 'var(--surface2)', borderRadius: 8, border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '.875rem' }}>{pv.name}</div>
                          <div style={{ fontSize: '.82rem', color: 'var(--text2)' }}>{pv.specialty}</div>
                        </div>
                        <a href={`tel:${pv.phone}`} className="btn btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.27 9.09 19.79 19.79 0 01.21 .45 2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.16 6.16l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                          {pv.phone}
                        </a>
                      </div>
                    )) : (
                      <div style={{ padding: '10px 12px', fontSize: '.82rem', color: 'var(--text3)', background: 'var(--surface2)', borderRadius: 6, border: '1px solid var(--border)' }}>
                        No phone number on file for this patient's prescriber(s).
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="modal-ft">
              <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
