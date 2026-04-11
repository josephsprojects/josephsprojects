'use client'
import { useState, useCallback } from 'react'
import Link from 'next/link'
import FinanceLogo from '@/components/FinanceLogo'

// ── Types ──────────────────────────────────────────────────────────────────────
interface CreditCard { id:string; name:string; bank?:string; last4?:string; limit:number; balance:number; apr:number; due_day?:number|null; min_payment?:number|null; rewards_type?:string; rewards_rate?:number|null; color:string; notes?:string; is_closed:boolean }
interface Subscription { id:string; name:string; amount:number; billing_cycle:string; next_billing?:string|null; category?:string; url?:string; notes?:string; is_active:boolean }
interface Bill { id:string; name:string; amount:number; due_day?:number|null; category?:string; auto_pay:boolean; notes?:string; is_active:boolean }
interface Person { id:string; name:string; color:string; email?:string; phone?:string }
interface Split { id:string; person_id:string; amount:number; paid:boolean; person:Person }
interface Expense { id:string; name:string; total:number; date:string; notes?:string; splits:Split[] }
interface Snapshot { id:string; label?:string; net_worth:number; total_debt:number; total_credit:number; utilization:number; created_at:string }

interface Props {
  user: { id:string; name:string; email:string }
  initialCards: CreditCard[]
  initialSubs: Subscription[]
  initialBills: Bill[]
  initialPeople: Person[]
  initialExpenses: Expense[]
  initialSnapshots: Snapshot[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const fmtD = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
const pct = (n: number) => `${Math.round(n)}%`
const utilColor = (u: number) => u >= 75 ? '#dc2626' : u >= 50 ? '#d97706' : u >= 30 ? '#ca8a04' : '#059669'
const COLORS = ['#4F6EF7','#059669','#7C3AED','#D97706','#DC2626','#0891B2','#DB2777','#65A30D']
const CARD_COLORS = ['#4F6EF7','#1a1a2e','#16213e','#0f3460','#533483','#2d6a4f','#1b4332','#6b21a8']

// ── Main Component ─────────────────────────────────────────────────────────────
export default function FinanceClient({ user, initialCards, initialSubs, initialBills, initialPeople, initialExpenses, initialSnapshots }: Props) {
  const [tab, setTab] = useState<'dash'|'cards'|'subs'|'bills'|'shared'|'history'|'payoff'>('dash')
  const [cards, setCards] = useState(initialCards)
  const [subs, setSubs] = useState(initialSubs)
  const [bills, setBills] = useState(initialBills)
  const [people, setPeople] = useState(initialPeople)
  const [expenses, setExpenses] = useState(initialExpenses)
  const [snapshots, setSnapshots] = useState(initialSnapshots)
  const [drawer, setDrawer] = useState<{type:string; item?:any}|null>(null)
  const [toast, setToast] = useState<{msg:string; ok:boolean}|null>(null)
  const [loading, setLoading] = useState(false)
  const [invoicePerson, setInvoicePerson] = useState<Person|null>(null)
  const [testSending, setTestSending] = useState(false)

  async function sendTestInvoice() {
    setTestSending(true)
    try {
      const r = await fetch('/api/finance/invoice/test', { method: 'POST' })
      const data = await r.json()
      if (data.success) showToast(`Test invoice sent to ${data.sentTo}`)
      else showToast(data.message || 'Failed to send test', false)
    } catch { showToast('Network error', false) }
    finally { setTestSending(false) }
  }

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  // ── API helpers ──────────────────────────────────────────────────────────────
  async function api(url: string, method = 'GET', body?: any) {
    const r = await fetch(url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
    })
    return r.json()
  }

  // ── Cards CRUD ───────────────────────────────────────────────────────────────
  async function saveCard(data: any) {
    setLoading(true)
    try {
      if (data.id) {
        await api(`/api/finance/cards?id=${data.id}`, 'PATCH', data)
        setCards(c => c.map(x => x.id === data.id ? { ...x, ...data } : x))
      } else {
        const r = await api('/api/finance/cards', 'POST', data)
        setCards(c => [...c, r.data])
      }
      setDrawer(null); showToast(data.id ? 'Card updated' : 'Card added')
    } finally { setLoading(false) }
  }
  async function deleteCard(id: string) {
    await api(`/api/finance/cards?id=${id}`, 'DELETE')
    setCards(c => c.filter(x => x.id !== id)); showToast('Card removed')
  }

  // ── Subs CRUD ────────────────────────────────────────────────────────────────
  async function saveSub(data: any) {
    setLoading(true)
    try {
      if (data.id) {
        await api(`/api/finance/subs?id=${data.id}`, 'PATCH', data)
        setSubs(s => s.map(x => x.id === data.id ? { ...x, ...data } : x))
      } else {
        const r = await api('/api/finance/subs', 'POST', data)
        setSubs(s => [...s, r.data])
      }
      setDrawer(null); showToast(data.id ? 'Subscription updated' : 'Subscription added')
    } finally { setLoading(false) }
  }
  async function deleteSub(id: string) {
    await api(`/api/finance/subs?id=${id}`, 'DELETE')
    setSubs(s => s.filter(x => x.id !== id)); showToast('Subscription removed')
  }

  // ── Bills CRUD ───────────────────────────────────────────────────────────────
  async function saveBill(data: any) {
    setLoading(true)
    try {
      if (data.id) {
        await api(`/api/finance/bills?id=${data.id}`, 'PATCH', data)
        setBills(b => b.map(x => x.id === data.id ? { ...x, ...data } : x))
      } else {
        const r = await api('/api/finance/bills', 'POST', data)
        setBills(b => [...b, r.data])
      }
      setDrawer(null); showToast(data.id ? 'Bill updated' : 'Bill added')
    } finally { setLoading(false) }
  }
  async function deleteBill(id: string) {
    await api(`/api/finance/bills?id=${id}`, 'DELETE')
    setBills(b => b.filter(x => x.id !== id)); showToast('Bill removed')
  }

  // ── People CRUD ──────────────────────────────────────────────────────────────
  async function savePerson(data: any) {
    setLoading(true)
    try {
      if (data.id) {
        await api(`/api/finance/shared/people?id=${data.id}`, 'PATCH', data)
        setPeople(p => p.map(x => x.id === data.id ? { ...x, ...data } : x))
      } else {
        const r = await api('/api/finance/shared/people', 'POST', data)
        setPeople(p => [...p, r.data])
      }
      setDrawer(null); showToast(data.id ? 'Person updated' : 'Person added')
    } finally { setLoading(false) }
  }
  async function deletePerson(id: string) {
    await api(`/api/finance/shared/people?id=${id}`, 'DELETE')
    setPeople(p => p.filter(x => x.id !== id)); showToast('Person removed')
  }

  // ── Expenses CRUD ────────────────────────────────────────────────────────────
  async function saveExpense(data: any) {
    setLoading(true)
    try {
      if (data.id) {
        await api(`/api/finance/shared?id=${data.id}`, 'PATCH', data)
        const r = await api('/api/finance/shared')
        setExpenses(r.data)
      } else {
        const r = await api('/api/finance/shared', 'POST', data)
        setExpenses(e => [r.data, ...e])
      }
      setDrawer(null); showToast(data.id ? 'Expense updated' : 'Expense added')
    } finally { setLoading(false) }
  }
  async function deleteExpense(id: string) {
    await api(`/api/finance/shared?id=${id}`, 'DELETE')
    setExpenses(e => e.filter(x => x.id !== id)); showToast('Expense removed')
  }
  async function toggleSplitPaid(expenseId: string, splitPersonId: string, paid: boolean) {
    const expense = expenses.find(e => e.id === expenseId)
    if (!expense) return
    const newSplits = expense.splits.map(s => s.person_id === splitPersonId ? { ...s, paid } : s)
    await api(`/api/finance/shared?id=${expenseId}`, 'PATCH', { splits: newSplits.map(s => ({ person_id: s.person_id, amount: s.amount, paid: s.paid })) })
    setExpenses(e => e.map(x => x.id === expenseId ? { ...x, splits: newSplits } : x))
  }

  // ── Snapshots ────────────────────────────────────────────────────────────────
  async function saveSnapshot() {
    const activeCards = cards.filter(c => !c.is_closed)
    const totalDebt = activeCards.reduce((s, c) => s + c.balance, 0)
    const totalCredit = activeCards.reduce((s, c) => s + c.limit, 0)
    const utilization = totalCredit > 0 ? (totalDebt / totalCredit) * 100 : 0
    const monthlyBills = bills.filter(b => b.is_active).reduce((s, b) => s + b.amount, 0)
    const monthlySubs = subs.filter(s => s.is_active).reduce((acc, s) => acc + (s.billing_cycle === 'yearly' ? s.amount / 12 : s.billing_cycle === 'weekly' ? s.amount * 4.33 : s.amount), 0)
    const net_worth = -(totalDebt + monthlyBills + monthlySubs)
    setLoading(true)
    try {
      const r = await api('/api/finance/snapshots', 'POST', {
        net_worth, total_debt: totalDebt, total_credit: totalCredit, utilization,
        data: { cards, subs, bills },
        label: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      })
      setSnapshots(s => [r.data, ...s]); showToast('Snapshot saved')
    } finally { setLoading(false) }
  }
  async function deleteSnapshot(id: string) {
    await api(`/api/finance/snapshots?id=${id}`, 'DELETE')
    setSnapshots(s => s.filter(x => x.id !== id)); showToast('Snapshot deleted')
  }

  // ── Computed values ───────────────────────────────────────────────────────────
  const activeCards = cards.filter(c => !c.is_closed)
  const totalBalance = activeCards.reduce((s, c) => s + c.balance, 0)
  const totalLimit = activeCards.reduce((s, c) => s + c.limit, 0)
  const utilization = totalLimit > 0 ? (totalBalance / totalLimit) * 100 : 0
  const monthlySubs = subs.filter(s => s.is_active).reduce((acc, s) => acc + (s.billing_cycle === 'yearly' ? s.amount / 12 : s.billing_cycle === 'weekly' ? s.amount * 4.33 : s.amount), 0)
  const monthlyBills = bills.filter(b => b.is_active).reduce((s, b) => s + b.amount, 0)
  const today = new Date().getDate()

  const daysUntilDue = (day?: number | null) => {
    if (!day) return null
    const now = new Date()
    let due = new Date(now.getFullYear(), now.getMonth(), day)
    if (due.getDate() < now.getDate()) due = new Date(now.getFullYear(), now.getMonth() + 1, day)
    return Math.ceil((due.getTime() - now.getTime()) / 86400000)
  }

  // ── Render Tabs ───────────────────────────────────────────────────────────────
  const TABS = [
    { id: 'dash', label: 'Dashboard', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
    { id: 'cards', label: 'Cards', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
    { id: 'subs', label: 'Subscriptions', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg> },
    { id: 'bills', label: 'Bills', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
    { id: 'shared', label: 'Shared', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg> },
    { id: 'history', label: 'History', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
    { id: 'payoff', label: 'Payoff', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> },
  ] as const

  return (
    <div style={{ minHeight: '100vh', background: '#F8F7F4', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' }}>
      {/* Nav */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 24, height: 56, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ marginRight: 8, flexShrink: 0 }}>
          <FinanceLogo size={30} variant="full" />
        </div>
        <div style={{ display: 'flex', gap: 2, overflowX: 'auto', flex: 1 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: 'none', background: tab === t.id ? '#eff2ff' : 'transparent', color: tab === t.id ? '#4F6EF7' : '#6b7280', fontWeight: tab === t.id ? 700 : 500, fontSize: '.82rem', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all .15s' }}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>
        <Link href="/owner" style={{ fontSize: '.78rem', color: '#9ca3af', fontWeight: 500 }}>CuraLog</Link>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px' }}>

        {/* ── DASHBOARD ── */}
        {tab === 'dash' && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111118' }}>Dashboard</h2>
              <p style={{ fontSize: '.875rem', color: '#6b7280', marginTop: 4 }}>Your financial overview</p>
            </div>
            {/* Metric cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14, marginBottom: 28 }}>
              {[
                { label: 'Total Credit Limit', value: fmt(totalLimit), sub: `${activeCards.length} active card${activeCards.length !== 1 ? 's' : ''}`, color: '#4F6EF7' },
                { label: 'Total Balance', value: fmt(totalBalance), sub: 'across all cards', color: '#dc2626' },
                { label: 'Utilization', value: pct(utilization), sub: utilization < 30 ? 'Excellent' : utilization < 50 ? 'Fair' : 'High', color: utilColor(utilization) },
                { label: 'Monthly Bills', value: fmt(monthlyBills), sub: `${bills.filter(b=>b.is_active).length} active bills`, color: '#d97706' },
                { label: 'Monthly Subs', value: fmt(monthlySubs), sub: `${subs.filter(s=>s.is_active).length} subscriptions`, color: '#7C3AED' },
                { label: 'Monthly Total', value: fmt(monthlyBills + monthlySubs), sub: 'bills + subscriptions', color: '#111118' },
              ].map(m => (
                <div key={m.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 20px' }}>
                  <div style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: '#9ca3af' }}>{m.label}</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: m.color, margin: '6px 0 2px', lineHeight: 1 }}>{m.value}</div>
                  <div style={{ fontSize: '.75rem', color: '#9ca3af' }}>{m.sub}</div>
                </div>
              ))}
            </div>

            {/* Utilization bar */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 24px', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontWeight: 700, fontSize: '.9rem' }}>Credit Utilization</span>
                <span style={{ fontSize: '.9rem', fontWeight: 800, color: utilColor(utilization) }}>{pct(utilization)}</span>
              </div>
              <div style={{ background: '#f3f4f6', borderRadius: 99, height: 10, overflow: 'hidden' }}>
                <div style={{ background: utilColor(utilization), height: '100%', width: `${Math.min(utilization, 100)}%`, borderRadius: 99, transition: 'width .6s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '.72rem', color: '#9ca3af' }}>
                <span>{fmt(totalBalance)} used</span><span>{fmt(totalLimit - totalBalance)} available</span>
              </div>
            </div>

            {/* Due soon */}
            {activeCards.filter(c => c.due_day).length > 0 && (
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 24px' }}>
                <div style={{ fontWeight: 700, fontSize: '.9rem', marginBottom: 14 }}>Upcoming Due Dates</div>
                {activeCards.filter(c => c.due_day).sort((a,b) => (daysUntilDue(a.due_day)||99) - (daysUntilDue(b.due_day)||99)).map(c => {
                  const d = daysUntilDue(c.due_day)
                  const urgent = d !== null && d <= 7
                  return (
                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.color }} />
                        <span style={{ fontSize: '.875rem', fontWeight: 600 }}>{c.name}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        <span style={{ fontSize: '.85rem', color: '#6b7280' }}>Min: {c.min_payment ? fmtD(c.min_payment) : '—'}</span>
                        <span style={{ fontSize: '.8rem', fontWeight: 700, color: urgent ? '#dc2626' : '#059669', background: urgent ? '#fef2f2' : '#f0fdf4', padding: '2px 10px', borderRadius: 99 }}>
                          {d === 0 ? 'Due today' : d === 1 ? 'Due tomorrow' : `Due in ${d} days`}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── CARDS ── */}
        {tab === 'cards' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div><h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111118' }}>Credit Cards</h2><p style={{ fontSize: '.875rem', color: '#6b7280', marginTop: 4 }}>{activeCards.length} active · {fmt(totalBalance)} balance · {pct(utilization)} utilization</p></div>
              <button onClick={() => setDrawer({ type: 'card' })} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#4F6EF7', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontWeight: 600, fontSize: '.85rem', cursor: 'pointer' }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M8 2v12M2 8h12"/></svg>Add Card
              </button>
            </div>
            {cards.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 24px', color: '#9ca3af' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ opacity: .3, marginBottom: 12 }}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                <p style={{ fontWeight: 600, color: '#374151' }}>No cards yet</p>
                <p style={{ fontSize: '.875rem', marginTop: 4 }}>Add your first credit card to start tracking</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {cards.map(c => {
                  const util = c.limit > 0 ? (c.balance / c.limit) * 100 : 0
                  const d = daysUntilDue(c.due_day)
                  return (
                    <div key={c.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '18px 20px', opacity: c.is_closed ? .5 : 1 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                        <div style={{ display: 'flex', gap: 14, flex: 1, minWidth: 0 }}>
                          <div style={{ width: 44, height: 44, borderRadius: 10, background: c.color, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.9)" strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: 700, fontSize: '.95rem', color: '#111118' }}>{c.name}</span>
                              {c.bank && <span style={{ fontSize: '.75rem', color: '#9ca3af' }}>{c.bank}</span>}
                              {c.last4 && <span style={{ fontSize: '.72rem', color: '#9ca3af' }}>···{c.last4}</span>}
                              {c.is_closed && <span style={{ fontSize: '.7rem', fontWeight: 700, background: '#f3f4f6', color: '#6b7280', padding: '1px 8px', borderRadius: 99 }}>Closed</span>}
                              {c.apr === 0 && <span style={{ fontSize: '.7rem', fontWeight: 700, background: '#f0fdf4', color: '#059669', padding: '1px 8px', borderRadius: 99 }}>0% APR</span>}
                            </div>
                            <div style={{ display: 'flex', gap: 16, marginTop: 6, flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '.8rem', color: '#6b7280' }}>APR: <strong>{c.apr}%</strong></span>
                              {c.due_day && <span style={{ fontSize: '.8rem', color: '#6b7280' }}>Due: <strong>day {c.due_day}</strong></span>}
                              {c.rewards_type && <span style={{ fontSize: '.8rem', color: '#6b7280' }}>{c.rewards_type}{c.rewards_rate ? ` ${c.rewards_rate}%` : ''}</span>}
                              {d !== null && <span style={{ fontSize: '.75rem', fontWeight: 700, color: d <= 7 ? '#dc2626' : '#059669' }}>{d === 0 ? 'Due today' : `${d}d until due`}</span>}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111118' }}>{fmt(c.balance)}</div>
                            <div style={{ fontSize: '.75rem', color: '#9ca3af' }}>of {fmt(c.limit)}</div>
                          </div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => setDrawer({ type: 'card', item: c })} style={{ background: '#f3f4f6', border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: '.75rem', fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Edit</button>
                            <button onClick={() => deleteCard(c.id)} style={{ background: '#fef2f2', border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: '.75rem', fontWeight: 600, cursor: 'pointer', color: '#dc2626' }}>Delete</button>
                          </div>
                        </div>
                      </div>
                      <div style={{ marginTop: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.72rem', color: '#9ca3af', marginBottom: 4 }}>
                          <span>{pct(util)} used</span><span style={{ color: utilColor(util), fontWeight: 700 }}>{util >= 30 ? (util >= 50 ? (util >= 75 ? 'High' : 'Fair') : 'Moderate') : 'Good'}</span>
                        </div>
                        <div style={{ background: '#f3f4f6', borderRadius: 99, height: 6 }}>
                          <div style={{ background: utilColor(util), height: '100%', width: `${Math.min(util, 100)}%`, borderRadius: 99, transition: 'width .6s' }} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── SUBSCRIPTIONS ── */}
        {tab === 'subs' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111118' }}>Subscriptions</h2>
                <p style={{ fontSize: '.875rem', color: '#6b7280', marginTop: 4 }}>{fmt(monthlySubs)}/mo · {fmt(monthlySubs * 12)}/yr</p>
              </div>
              <button onClick={() => setDrawer({ type: 'sub' })} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#4F6EF7', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontWeight: 600, fontSize: '.85rem', cursor: 'pointer' }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M8 2v12M2 8h12"/></svg>Add
              </button>
            </div>
            {subs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 24px', color: '#9ca3af' }}>
                <p style={{ fontWeight: 600, color: '#374151' }}>No subscriptions yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {subs.map(s => {
                  const monthly = s.billing_cycle === 'yearly' ? s.amount / 12 : s.billing_cycle === 'weekly' ? s.amount * 4.33 : s.amount
                  return (
                    <div key={s.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, opacity: s.is_active ? 1 : .5 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eff2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4F6EF7" strokeWidth="2" strokeLinecap="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '.9rem', color: '#111118' }}>{s.name}</div>
                        <div style={{ fontSize: '.78rem', color: '#9ca3af', marginTop: 2 }}>
                          {s.category && <span>{s.category} · </span>}
                          <span style={{ textTransform: 'capitalize' }}>{s.billing_cycle}</span>
                          {s.next_billing && <span> · Next: {new Date(s.next_billing).toLocaleDateString()}</span>}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: '#111118' }}>{fmtD(s.amount)}<span style={{ fontSize: '.72rem', color: '#9ca3af', fontWeight: 500 }}>/{s.billing_cycle === 'yearly' ? 'yr' : s.billing_cycle === 'weekly' ? 'wk' : 'mo'}</span></div>
                        {s.billing_cycle !== 'monthly' && <div style={{ fontSize: '.72rem', color: '#9ca3af' }}>{fmtD(monthly)}/mo</div>}
                      </div>
                      <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                        <button onClick={() => setDrawer({ type: 'sub', item: s })} style={{ background: '#f3f4f6', border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: '.75rem', fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Edit</button>
                        <button onClick={() => deleteSub(s.id)} style={{ background: '#fef2f2', border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: '.75rem', fontWeight: 600, cursor: 'pointer', color: '#dc2626' }}>Delete</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── BILLS ── */}
        {tab === 'bills' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111118' }}>Bills</h2>
                <p style={{ fontSize: '.875rem', color: '#6b7280', marginTop: 4 }}>{fmt(monthlyBills)}/mo · {bills.filter(b=>b.auto_pay).length} on autopay</p>
              </div>
              <button onClick={() => setDrawer({ type: 'bill' })} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#4F6EF7', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontWeight: 600, fontSize: '.85rem', cursor: 'pointer' }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M8 2v12M2 8h12"/></svg>Add
              </button>
            </div>
            {bills.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 24px', color: '#9ca3af' }}>
                <p style={{ fontWeight: 600, color: '#374151' }}>No bills yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {bills.sort((a,b) => (a.due_day||99) - (b.due_day||99)).map(b => (
                  <div key={b.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, opacity: b.is_active ? 1 : .5 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fef9c3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: '.9rem', color: '#111118' }}>{b.name}</span>
                        {b.auto_pay && <span style={{ fontSize: '.68rem', fontWeight: 700, background: '#f0fdf4', color: '#059669', padding: '1px 7px', borderRadius: 99 }}>Autopay</span>}
                      </div>
                      <div style={{ fontSize: '.78rem', color: '#9ca3af', marginTop: 2 }}>
                        {b.category && <span>{b.category} · </span>}
                        {b.due_day ? <span>Due day {b.due_day}</span> : <span>No due day set</span>}
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: '#111118', flexShrink: 0 }}>{fmtD(b.amount)}</div>
                    <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                      <button onClick={() => setDrawer({ type: 'bill', item: b })} style={{ background: '#f3f4f6', border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: '.75rem', fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Edit</button>
                      <button onClick={() => deleteBill(b.id)} style={{ background: '#fef2f2', border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: '.75rem', fontWeight: 600, cursor: 'pointer', color: '#dc2626' }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SHARED ── */}
        {tab === 'shared' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div><h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111118' }}>Shared Expenses</h2><p style={{ fontSize: '.875rem', color: '#6b7280', marginTop: 4 }}>{people.length} people · {expenses.length} expenses</p></div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={sendTestInvoice} disabled={testSending} title="Send a sample invoice to your account email" style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f3f4f6', color: '#6b7280', border: '1px dashed #d1d5db', borderRadius: 8, padding: '9px 14px', fontWeight: 600, fontSize: '.82rem', cursor: 'pointer', opacity: testSending ? .6 : 1 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  {testSending ? 'Sending…' : 'Test Invoice'}
                </button>
                <button onClick={() => setDrawer({ type: 'person' })} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 8, padding: '9px 14px', fontWeight: 600, fontSize: '.82rem', cursor: 'pointer' }}>
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M8 2v12M2 8h12"/></svg>Person
                </button>
                <button onClick={() => setDrawer({ type: 'expense' })} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#4F6EF7', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 14px', fontWeight: 600, fontSize: '.82rem', cursor: 'pointer' }}>
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M8 2v12M2 8h12"/></svg>Expense
                </button>
              </div>
            </div>

            {/* People summary */}
            {people.length > 0 && (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
                {people.map(p => {
                  const owed = expenses.reduce((sum, e) => {
                    const split = e.splits.find(s => s.person_id === p.id)
                    return sum + (split && !split.paid ? split.amount : 0)
                  }, 0)
                  return (
                    <div key={p.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '.8rem', flexShrink: 0 }}>
                        {p.name.slice(0,1).toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '.85rem', color: '#111118' }}>{p.name}</div>
                        <div style={{ fontSize: '.75rem', color: owed > 0 ? '#dc2626' : '#059669', fontWeight: 600 }}>{owed > 0 ? `Owes ${fmtD(owed)}` : 'All settled'}</div>
                        {p.email && <div style={{ fontSize: '.7rem', color: '#9ca3af', marginTop: 1 }}>{p.email}</div>}
                      </div>
                      <div style={{ display: 'flex', gap: 4, marginLeft: 4, flexShrink: 0 }}>
                        {owed > 0 && p.email && (
                          <button onClick={() => setInvoicePerson(p)} style={{ background: '#eff2ff', border: 'none', borderRadius: 6, padding: '4px 9px', fontSize: '.72rem', fontWeight: 600, cursor: 'pointer', color: '#4F6EF7' }} title="Send invoice">Invoice</button>
                        )}
                        <button onClick={() => setDrawer({ type: 'person', item: p })} style={{ background: '#f3f4f6', border: 'none', borderRadius: 6, padding: '4px 8px', fontSize: '.75rem', cursor: 'pointer', color: '#6b7280' }} title="Edit">✎</button>
                        <button onClick={() => deletePerson(p.id)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}>×</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Expenses */}
            {expenses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 24px', color: '#9ca3af' }}>
                <p style={{ fontWeight: 600, color: '#374151' }}>No shared expenses yet</p>
                <p style={{ fontSize: '.875rem', marginTop: 4 }}>Add people first, then log shared expenses</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {expenses.map(e => (
                  <div key={e.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '.95rem', color: '#111118' }}>{e.name}</div>
                        <div style={{ fontSize: '.78rem', color: '#9ca3af', marginTop: 2 }}>{new Date(e.date).toLocaleDateString()}{e.notes && ` · ${e.notes}`}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontWeight: 800, fontSize: '1rem', color: '#111118' }}>{fmtD(e.total)}</span>
                        <button onClick={() => deleteExpense(e.id)} style={{ background: '#fef2f2', border: 'none', borderRadius: 6, padding: '4px 9px', fontSize: '.72rem', fontWeight: 600, cursor: 'pointer', color: '#dc2626' }}>Delete</button>
                      </div>
                    </div>
                    {e.splits.length > 0 && (
                      <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {e.splits.map(s => (
                          <button key={s.person_id} onClick={() => toggleSplitPaid(e.id, s.person_id, !s.paid)}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, background: s.paid ? '#f0fdf4' : '#fef2f2', border: `1px solid ${s.paid ? '#bbf7d0' : '#fecaca'}`, borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontSize: '.78rem', fontWeight: 600, color: s.paid ? '#059669' : '#dc2626' }}>
                            <span style={{ width: 18, height: 18, borderRadius: '50%', background: s.person.color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '.65rem' }}>{s.person.name[0]}</span>
                            {s.person.name}: {fmtD(s.amount)} {s.paid ? '✓' : '·'}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── HISTORY ── */}
        {tab === 'history' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div><h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111118' }}>History</h2><p style={{ fontSize: '.875rem', color: '#6b7280', marginTop: 4 }}>Snapshots of your financial state over time</p></div>
              <button onClick={saveSnapshot} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#4F6EF7', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontWeight: 600, fontSize: '.85rem', cursor: 'pointer', opacity: loading ? .7 : 1 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                Save Snapshot
              </button>
            </div>
            {snapshots.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 24px', color: '#9ca3af' }}>
                <p style={{ fontWeight: 600, color: '#374151' }}>No snapshots yet</p>
                <p style={{ fontSize: '.875rem', marginTop: 4 }}>Save a snapshot to track your progress over time</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {snapshots.map((s, i) => (
                  <div key={s.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '.9rem', color: '#111118' }}>{s.label || new Date(s.created_at).toLocaleDateString()}</div>
                      <div style={{ fontSize: '.75rem', color: '#9ca3af', marginTop: 2 }}>{new Date(s.created_at).toLocaleString()}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 24, flexShrink: 0 }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '.65rem', textTransform: 'uppercase', letterSpacing: '.05em', color: '#9ca3af', fontWeight: 700 }}>Balance</div>
                        <div style={{ fontWeight: 800, color: '#dc2626' }}>{fmt(s.total_debt)}</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '.65rem', textTransform: 'uppercase', letterSpacing: '.05em', color: '#9ca3af', fontWeight: 700 }}>Limit</div>
                        <div style={{ fontWeight: 800, color: '#374151' }}>{fmt(s.total_credit)}</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '.65rem', textTransform: 'uppercase', letterSpacing: '.05em', color: '#9ca3af', fontWeight: 700 }}>Util</div>
                        <div style={{ fontWeight: 800, color: utilColor(s.utilization) }}>{pct(s.utilization)}</div>
                      </div>
                    </div>
                    <button onClick={() => deleteSnapshot(s.id)} style={{ background: '#fef2f2', border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: '.75rem', fontWeight: 600, cursor: 'pointer', color: '#dc2626', flexShrink: 0 }}>Delete</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PAYOFF ── */}
        {tab === 'payoff' && <PayoffTab cards={activeCards} />}

      </div>

      {/* ── DRAWERS ── */}
      {drawer && (
        <div onClick={() => setDrawer(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,.3)' }}>
            {drawer.type === 'card' && <CardForm item={drawer.item} onSave={saveCard} onClose={() => setDrawer(null)} loading={loading} />}
            {drawer.type === 'sub' && <SubForm item={drawer.item} onSave={saveSub} onClose={() => setDrawer(null)} loading={loading} />}
            {drawer.type === 'bill' && <BillForm item={drawer.item} onSave={saveBill} onClose={() => setDrawer(null)} loading={loading} />}
            {drawer.type === 'person' && <PersonForm item={drawer.item} onSave={savePerson} onClose={() => setDrawer(null)} loading={loading} />}
            {drawer.type === 'expense' && <ExpenseForm people={people} onSave={saveExpense} onClose={() => setDrawer(null)} loading={loading} />}
          </div>
        </div>
      )}

      {/* ── INVOICE MODAL ── */}
      {invoicePerson && (
        <InvoiceModal
          person={invoicePerson}
          expenses={expenses}
          onClose={() => setInvoicePerson(null)}
          onSent={() => { setInvoicePerson(null); showToast(`Invoice sent to ${invoicePerson.name}`) }}
          onError={(msg) => { showToast(msg, false) }}
        />
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: toast.ok ? '#059669' : '#dc2626', color: '#fff', padding: '12px 20px', borderRadius: 10, fontWeight: 600, fontSize: '.875rem', boxShadow: '0 4px 20px rgba(0,0,0,.2)', zIndex: 9999, animation: 'slideIn .2s ease' }}>
          {toast.msg}
        </div>
      )}

      <style>{`@keyframes slideIn{from{transform:translateX(20px);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
    </div>
  )
}

// ── Payoff Tab ─────────────────────────────────────────────────────────────────
function PayoffTab({ cards }: { cards: CreditCard[] }) {
  const [monthly, setMonthly] = useState(500)
  const [method, setMethod] = useState<'avalanche'|'snowball'>('avalanche')

  const debts = cards.filter(c => c.balance > 0).map(c => ({ ...c, minPayment: c.min_payment || Math.max(25, c.balance * 0.02) }))
  const totalMin = debts.reduce((s, d) => s + d.minPayment, 0)
  const extra = Math.max(0, monthly - totalMin)

  function simulate() {
    if (debts.length === 0) return []
    let remaining = debts.map(d => ({ ...d, bal: d.balance }))
    const sorted = method === 'avalanche'
      ? [...remaining].sort((a, b) => b.apr - a.apr)
      : [...remaining].sort((a, b) => a.bal - b.bal)

    let months = 0; let totalInterest = 0
    const timeline: { month: number; totalBal: number }[] = []

    while (remaining.some(d => d.bal > 0) && months < 360) {
      months++
      let extraLeft = extra
      // Pay minimums + interest
      remaining = remaining.map(d => {
        if (d.bal <= 0) return d
        const interest = (d.bal * (d.apr / 100)) / 12
        totalInterest += interest
        d.bal = Math.max(0, d.bal + interest - d.minPayment)
        return d
      })
      // Apply extra to priority card
      for (const target of sorted) {
        const r = remaining.find(d => d.id === target.id)
        if (!r || r.bal <= 0) continue
        const pay = Math.min(r.bal, extraLeft)
        r.bal -= pay; extraLeft -= pay
        if (extraLeft <= 0) break
      }
      timeline.push({ month: months, totalBal: remaining.reduce((s, d) => s + d.bal, 0) })
    }
    return { months, totalInterest, timeline }
  }

  const result = debts.length > 0 ? simulate() : null

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111118' }}>Debt Payoff Planner</h2>
        <p style={{ fontSize: '.875rem', color: '#6b7280', marginTop: 4 }}>See how fast you can pay off your cards</p>
      </div>
      {debts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 24px', color: '#9ca3af' }}>
          <p style={{ fontWeight: 600, color: '#374151' }}>No card balances to pay off</p>
          <p style={{ fontSize: '.875rem', marginTop: 4 }}>Great job!</p>
        </div>
      ) : (
        <>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 24px', marginBottom: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: '.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Monthly Payment</label>
                <input type="number" value={monthly} onChange={e => setMonthly(Number(e.target.value))} min={totalMin} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: '.95rem', fontWeight: 700 }} />
                <div style={{ fontSize: '.72rem', color: '#9ca3af', marginTop: 4 }}>Minimum: {fmtD(totalMin)}</div>
              </div>
              <div>
                <label style={{ fontSize: '.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Strategy</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['avalanche','snowball'] as const).map(m => (
                    <button key={m} onClick={() => setMethod(m)} style={{ flex: 1, padding: '9px', border: `1.5px solid ${method === m ? '#4F6EF7' : '#e5e7eb'}`, borderRadius: 8, background: method === m ? '#eff2ff' : '#fff', color: method === m ? '#4F6EF7' : '#374151', fontWeight: 600, fontSize: '.8rem', cursor: 'pointer', textTransform: 'capitalize' }}>{m}</button>
                  ))}
                </div>
                <div style={{ fontSize: '.72rem', color: '#9ca3af', marginTop: 4 }}>{method === 'avalanche' ? 'Highest APR first (saves most interest)' : 'Lowest balance first (quick wins)'}</div>
              </div>
            </div>
          </div>

          {result && typeof result === 'object' && 'months' in result && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
                {[
                  { label: 'Payoff Time', value: `${Math.floor(result.months/12)}y ${result.months%12}m`, color: '#4F6EF7' },
                  { label: 'Total Interest', value: fmt(result.totalInterest), color: '#dc2626' },
                  { label: 'Total Paid', value: fmt(debts.reduce((s,d)=>s+d.balance,0) + result.totalInterest), color: '#374151' },
                ].map(m => (
                  <div key={m.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: '#9ca3af' }}>{m.label}</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: m.color, marginTop: 6 }}>{m.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 24px' }}>
                <div style={{ fontWeight: 700, fontSize: '.9rem', marginBottom: 16 }}>Payoff Order ({method})</div>
                {debts.sort((a,b) => method === 'avalanche' ? b.apr - a.apr : a.balance - b.balance).map((d, i) => (
                  <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#eff2ff', color: '#4F6EF7', fontWeight: 800, fontSize: '.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i+1}</div>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                    <span style={{ flex: 1, fontWeight: 600, fontSize: '.875rem' }}>{d.name}</span>
                    <span style={{ fontSize: '.8rem', color: '#6b7280' }}>{d.apr}% APR</span>
                    <span style={{ fontWeight: 700, fontSize: '.875rem' }}>{fmt(d.balance)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

// ── Forms ──────────────────────────────────────────────────────────────────────
function FormWrap({ title, onClose, onSubmit, loading, children }: any) {
  return (
    <form onSubmit={onSubmit}>
      <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#111118' }}>{title}</h3>
        <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.3rem', color: '#9ca3af', cursor: 'pointer', lineHeight: 1 }}>×</button>
      </div>
      <div style={{ padding: '20px 24px' }}>{children}</div>
      <div style={{ padding: '14px 24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button type="button" onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '9px 18px', fontWeight: 600, fontSize: '.875rem', cursor: 'pointer', color: '#374151' }}>Cancel</button>
        <button type="submit" disabled={loading} style={{ background: '#4F6EF7', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontWeight: 600, fontSize: '.875rem', cursor: 'pointer', opacity: loading ? .7 : 1 }}>
          {loading ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  )
}

const FG = ({ label, children }: any) => <div style={{ marginBottom: 14 }}><label style={{ fontSize: '.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>{label}</label>{children}</div>
const INP = (props: any) => <input {...props} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: '.875rem', outline: 'none', ...props.style }} />
const SEL = (props: any) => <select {...props} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: '.875rem', background: '#fff', ...props.style }} />

function CardForm({ item, onSave, onClose, loading }: any) {
  const defaults = { name: '', bank: '', last4: '', limit: '', balance: '', apr: '', due_day: '', min_payment: '', rewards_type: '', rewards_rate: '', color: '#4F6EF7', notes: '', is_closed: false }
  const fromItem = item ? { ...item, limit: item.limit ?? '', balance: item.balance ?? '', apr: item.apr ?? '', due_day: item.due_day ?? '', min_payment: item.min_payment ?? '', rewards_rate: item.rewards_rate ?? '' } : {}
  const [f, setF] = useState({ ...defaults, ...fromItem })
  const set = (k: string, v: any) => setF((p: any) => ({ ...p, [k]: v }))
  const submit = (e: any) => { e.preventDefault(); onSave({ ...f, id: item?.id, limit: Number(f.limit)||0, balance: Number(f.balance)||0, apr: Number(f.apr)||0, due_day: f.due_day ? Number(f.due_day) : null, min_payment: f.min_payment ? Number(f.min_payment) : null, rewards_rate: f.rewards_rate ? Number(f.rewards_rate) : null }) }
  return (
    <FormWrap title={item ? 'Edit Card' : 'Add Card'} onClose={onClose} onSubmit={submit} loading={loading}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <FG label="Card name *"><INP value={f.name} onChange={(e:any)=>set('name',e.target.value)} placeholder="Chase Sapphire" required /></FG>
        <FG label="Bank"><INP value={f.bank} onChange={(e:any)=>set('bank',e.target.value)} placeholder="Chase" /></FG>
        <FG label="Last 4 digits"><INP value={f.last4} onChange={(e:any)=>set('last4',e.target.value)} placeholder="4242" maxLength={4} /></FG>
        <FG label="Color"><div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{CARD_COLORS.map(c => <button key={c} type="button" onClick={()=>set('color',c)} style={{ width: 28, height: 28, borderRadius: 6, background: c, border: f.color===c ? '3px solid #111' : '2px solid transparent', cursor: 'pointer' }} />)}</div></FG>
        <FG label="Credit limit *"><INP type="number" value={f.limit} onChange={(e:any)=>set('limit',e.target.value)} placeholder="5000" min="0" /></FG>
        <FG label="Current balance *"><INP type="number" value={f.balance} onChange={(e:any)=>set('balance',e.target.value)} placeholder="0" min="0" /></FG>
        <FG label="APR (%)"><INP type="number" value={f.apr} onChange={(e:any)=>set('apr',e.target.value)} placeholder="19.99" min="0" step="0.01" /></FG>
        <FG label="Due day of month"><INP type="number" value={f.due_day} onChange={(e:any)=>set('due_day',e.target.value)} placeholder="15" min="1" max="31" /></FG>
        <FG label="Min payment"><INP type="number" value={f.min_payment} onChange={(e:any)=>set('min_payment',e.target.value)} placeholder="25" min="0" /></FG>
        <FG label="Rewards type"><INP value={f.rewards_type} onChange={(e:any)=>set('rewards_type',e.target.value)} placeholder="Cashback / Points" /></FG>
        <FG label="Rewards rate (%)"><INP type="number" value={f.rewards_rate} onChange={(e:any)=>set('rewards_rate',e.target.value)} placeholder="1.5" min="0" step="0.01" /></FG>
        <FG label="Status"><div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}><input type="checkbox" checked={f.is_closed} onChange={e=>set('is_closed',e.target.checked)} id="closed" /><label htmlFor="closed" style={{ fontSize: '.875rem' }}>Closed card</label></div></FG>
      </div>
      <FG label="Notes"><INP as="textarea" value={f.notes} onChange={(e:any)=>set('notes',e.target.value)} placeholder="Any notes…" style={{ resize: 'vertical', minHeight: 60 }} /></FG>
    </FormWrap>
  )
}

function SubForm({ item, onSave, onClose, loading }: any) {
  const defaults = { name: '', amount: '', billing_cycle: 'monthly', next_billing: '', category: '', url: '', notes: '', is_active: true }
  const fromItem = item ? { ...item, amount: item.amount ?? '' } : {}
  const [f, setF] = useState({ ...defaults, ...fromItem })
  const set = (k: string, v: any) => setF((p: any) => ({ ...p, [k]: v }))
  const submit = (e: any) => { e.preventDefault(); onSave({ ...f, id: item?.id, amount: Number(f.amount)||0 }) }
  return (
    <FormWrap title={item ? 'Edit Subscription' : 'Add Subscription'} onClose={onClose} onSubmit={submit} loading={loading}>
      <FG label="Name *"><INP value={f.name} onChange={(e:any)=>set('name',e.target.value)} placeholder="Netflix" required /></FG>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <FG label="Amount *"><INP type="number" value={f.amount} onChange={(e:any)=>set('amount',e.target.value)} placeholder="15.99" min="0" step="0.01" required /></FG>
        <FG label="Billing cycle"><SEL value={f.billing_cycle} onChange={(e:any)=>set('billing_cycle',e.target.value)}><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option></SEL></FG>
        <FG label="Category"><INP value={f.category} onChange={(e:any)=>set('category',e.target.value)} placeholder="Streaming, Software…" /></FG>
        <FG label="Next billing"><INP type="date" value={f.next_billing?.split('T')[0]||''} onChange={(e:any)=>set('next_billing',e.target.value)} /></FG>
      </div>
      <FG label="URL"><INP value={f.url} onChange={(e:any)=>set('url',e.target.value)} placeholder="https://…" /></FG>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}><input type="checkbox" checked={f.is_active} onChange={e=>set('is_active',e.target.checked)} id="active" /><label htmlFor="active" style={{ fontSize: '.875rem', fontWeight: 600 }}>Active</label></div>
    </FormWrap>
  )
}

function BillForm({ item, onSave, onClose, loading }: any) {
  const defaults = { name: '', amount: '', due_day: '', category: '', auto_pay: false, notes: '', is_active: true }
  const fromItem = item ? { ...item, amount: item.amount ?? '', due_day: item.due_day ?? '' } : {}
  const [f, setF] = useState({ ...defaults, ...fromItem })
  const set = (k: string, v: any) => setF((p: any) => ({ ...p, [k]: v }))
  const submit = (e: any) => { e.preventDefault(); onSave({ ...f, id: item?.id, amount: Number(f.amount)||0, due_day: f.due_day ? Number(f.due_day) : null }) }
  return (
    <FormWrap title={item ? 'Edit Bill' : 'Add Bill'} onClose={onClose} onSubmit={submit} loading={loading}>
      <FG label="Name *"><INP value={f.name} onChange={(e:any)=>set('name',e.target.value)} placeholder="Rent, Electric…" required /></FG>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <FG label="Amount *"><INP type="number" value={f.amount} onChange={(e:any)=>set('amount',e.target.value)} placeholder="1200" min="0" step="0.01" required /></FG>
        <FG label="Due day of month"><INP type="number" value={f.due_day} onChange={(e:any)=>set('due_day',e.target.value)} placeholder="1" min="1" max="31" /></FG>
        <FG label="Category"><INP value={f.category} onChange={(e:any)=>set('category',e.target.value)} placeholder="Housing, Utilities…" /></FG>
      </div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><input type="checkbox" checked={f.auto_pay} onChange={e=>set('auto_pay',e.target.checked)} id="autopay" /><label htmlFor="autopay" style={{ fontSize: '.875rem', fontWeight: 600 }}>Autopay</label></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><input type="checkbox" checked={f.is_active} onChange={e=>set('is_active',e.target.checked)} id="bactive" /><label htmlFor="bactive" style={{ fontSize: '.875rem', fontWeight: 600 }}>Active</label></div>
      </div>
      <FG label="Notes"><INP value={f.notes} onChange={(e:any)=>set('notes',e.target.value)} placeholder="Any notes…" /></FG>
    </FormWrap>
  )
}

function PersonForm({ item, onSave, onClose, loading }: any) {
  const defaults = { name: '', color: '#4F6EF7', email: '', phone: '' }
  const fromItem = item ? { ...item, email: item.email ?? '', phone: item.phone ?? '' } : {}
  const [f, setF] = useState({ ...defaults, ...fromItem })
  const set = (k: string, v: any) => setF((p: any) => ({ ...p, [k]: v }))
  const submit = (e: any) => { e.preventDefault(); onSave({ ...f, id: item?.id, email: f.email || undefined, phone: f.phone || undefined }) }
  return (
    <FormWrap title={item ? 'Edit Person' : 'Add Person'} onClose={onClose} onSubmit={submit} loading={loading}>
      <FG label="Name *"><INP value={f.name} onChange={(e:any)=>set('name',e.target.value)} placeholder="Jane" required /></FG>
      <FG label="Email"><INP type="email" value={f.email} onChange={(e:any)=>set('email',e.target.value)} placeholder="jane@example.com" /></FG>
      <FG label="Phone"><INP type="tel" value={f.phone} onChange={(e:any)=>set('phone',e.target.value)} placeholder="+1 555 000 0000" /></FG>
      <FG label="Color"><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{COLORS.map(c => <button key={c} type="button" onClick={()=>set('color',c)} style={{ width: 32, height: 32, borderRadius: 8, background: c, border: f.color===c ? '3px solid #111' : '2px solid transparent', cursor: 'pointer' }} />)}</div></FG>
    </FormWrap>
  )
}

// ── Invoice Modal ──────────────────────────────────────────────────────────────
function InvoiceModal({ person, expenses, onClose, onSent, onError }: { person: Person; expenses: Expense[]; onClose: () => void; onSent: () => void; onError: (msg: string) => void }) {
  const [note, setNote] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [sending, setSending] = useState(false)
  const [copied, setCopied] = useState(false)

  const unpaidSplits = expenses.flatMap(e =>
    e.splits.filter(s => s.person_id === person.id && !s.paid).map(s => ({ ...s, expenseName: e.name, expenseDate: e.date }))
  )
  const total = unpaidSplits.reduce((s, sp) => s + sp.amount, 0)
  const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

  async function sendInvoice() {
    setSending(true)
    try {
      const r = await fetch('/api/finance/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ person_id: person.id, note: note || null, due_date: dueDate || null }),
      })
      const data = await r.json()
      if (data.success) { onSent() } else { onError(data.message || 'Failed to send invoice'); }
    } catch { onError('Network error. Please try again.') }
    finally { setSending(false) }
  }

  function copyAsText() {
    const lines = [
      `Invoice for ${person.name}`,
      `──────────────────────`,
      ...unpaidSplits.map(s => `${s.expenseName}  ${new Date(s.expenseDate).toLocaleDateString()}  ${fmt(s.amount)}`),
      `──────────────────────`,
      `Total Due: ${fmt(total)}`,
      dueDate ? `Due By: ${new Date(dueDate).toLocaleDateString()}` : '',
      note ? `\nNote: ${note}` : '',
    ].filter(Boolean).join('\n')
    navigator.clipboard.writeText(lines).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,.3)' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#111118', margin: 0 }}>Send Invoice</h3>
            <p style={{ fontSize: '.78rem', color: '#9ca3af', margin: '2px 0 0' }}>To: {person.name}{person.email ? ` · ${person.email}` : ''}</p>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.3rem', color: '#9ca3af', cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px' }}>
          {unpaidSplits.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af' }}>
              <p style={{ fontWeight: 600, color: '#374151' }}>Nothing to invoice</p>
              <p style={{ fontSize: '.875rem', marginTop: 4 }}>{person.name} has no unpaid items</p>
            </div>
          ) : (
            <>
              {/* Itemized list */}
              <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 10, marginBottom: 18, overflow: 'hidden' }}>
                <div style={{ padding: '10px 16px', borderBottom: '1px solid #e5e7eb', display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 12 }}>
                  <span style={{ fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: '#9ca3af' }}>Description</span>
                  <span style={{ fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: '#9ca3af' }}>Date</span>
                  <span style={{ fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: '#9ca3af', textAlign: 'right' }}>Amount</span>
                </div>
                {unpaidSplits.map(s => (
                  <div key={s.id} style={{ padding: '10px 16px', borderBottom: '1px solid #f3f4f6', display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 12, alignItems: 'center' }}>
                    <span style={{ fontSize: '.875rem', color: '#111118', fontWeight: 500 }}>{s.expenseName}</span>
                    <span style={{ fontSize: '.75rem', color: '#9ca3af', whiteSpace: 'nowrap' }}>{new Date(s.expenseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    <span style={{ fontSize: '.875rem', fontWeight: 700, color: '#111118', textAlign: 'right' }}>{fmt(s.amount)}</span>
                  </div>
                ))}
                <div style={{ padding: '12px 16px', background: '#eff2ff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '.875rem', color: '#111118' }}>Total Due</span>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#4F6EF7' }}>{fmt(total)}</span>
                </div>
              </div>

              {/* Optional fields */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: '.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Due date (optional)</label>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: '.875rem', outline: 'none' }} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: '.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Note (optional)</label>
                <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Add a personal note…" rows={3} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: '.875rem', resize: 'vertical', outline: 'none', fontFamily: 'inherit' }} />
              </div>

              {!person.email && (
                <div style={{ background: '#fef9c3', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: '.8rem', color: '#78350f' }}>
                  No email on file for {person.name}. Edit the person to add one, or use "Copy as text" to share manually.
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {unpaidSplits.length > 0 && (
          <div style={{ padding: '14px 24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <button type="button" onClick={copyAsText} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '9px 16px', fontWeight: 600, fontSize: '.82rem', cursor: 'pointer', color: '#374151' }}>
              {copied ? '✓ Copied!' : 'Copy as text'}
            </button>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '9px 16px', fontWeight: 600, fontSize: '.875rem', cursor: 'pointer', color: '#374151' }}>Cancel</button>
              {person.email && (
                <button type="button" onClick={sendInvoice} disabled={sending} style={{ background: '#4F6EF7', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontWeight: 600, fontSize: '.875rem', cursor: 'pointer', opacity: sending ? .7 : 1 }}>
                  {sending ? 'Sending…' : 'Send Invoice'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ExpenseForm({ people, onSave, onClose, loading }: any) {
  const [f, setF] = useState({ name: '', total: '', date: new Date().toISOString().split('T')[0], notes: '' })
  const [splits, setSplits] = useState<Record<string,string>>({})
  const set = (k: string, v: any) => setF((p: any) => ({ ...p, [k]: v }))
  const submit = (e: any) => {
    e.preventDefault()
    const splitArr = Object.entries(splits).filter(([,v])=>Number(v)>0).map(([person_id,amount])=>({ person_id, amount: Number(amount), paid: false }))
    onSave({ ...f, total: Number(f.total)||0, splits: splitArr })
  }
  const splitEvenly = () => {
    const n = people.length; if (!n) return
    const each = (Number(f.total)/n).toFixed(2)
    const s: Record<string,string> = {}; people.forEach((p:Person)=>{ s[p.id]=each }); setSplits(s)
  }
  return (
    <FormWrap title="Add Shared Expense" onClose={onClose} onSubmit={submit} loading={loading}>
      <FG label="Description *"><INP value={f.name} onChange={(e:any)=>set('name',e.target.value)} placeholder="Dinner, groceries…" required /></FG>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <FG label="Total *"><INP type="number" value={f.total} onChange={(e:any)=>set('total',e.target.value)} placeholder="100" min="0" step="0.01" required /></FG>
        <FG label="Date"><INP type="date" value={f.date} onChange={(e:any)=>set('date',e.target.value)} /></FG>
      </div>
      {people.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={{ fontSize: '.8rem', fontWeight: 600, color: '#374151' }}>Split between</label>
            <button type="button" onClick={splitEvenly} style={{ background: '#eff2ff', border: 'none', borderRadius: 6, padding: '3px 10px', fontSize: '.72rem', fontWeight: 600, color: '#4F6EF7', cursor: 'pointer' }}>Split evenly</button>
          </div>
          {people.map((p: Person) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: p.color, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '.75rem' }}>{p.name[0]}</div>
              <span style={{ flex: 1, fontSize: '.875rem', fontWeight: 600 }}>{p.name}</span>
              <INP type="number" value={splits[p.id]||''} onChange={(e:any)=>setSplits(s=>({...s,[p.id]:e.target.value}))} placeholder="0.00" min="0" step="0.01" style={{ width: 100 }} />
            </div>
          ))}
        </div>
      )}
      <FG label="Notes"><INP value={f.notes} onChange={(e:any)=>set('notes',e.target.value)} placeholder="Optional notes…" /></FG>
    </FormWrap>
  )
}
