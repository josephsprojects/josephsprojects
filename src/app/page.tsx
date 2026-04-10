import type { Metadata } from 'next'
import Script from 'next/script'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'DataPrimeTech — Custom Web Applications',
  description: 'We design and build fast, secure, custom web applications. Real tools built around real workflows — not templates, not demos.',
  openGraph: {
    title: 'DataPrimeTech — Custom Web Applications',
    description: 'Fast, secure, custom software built around real workflows. Not demos — tools people actually use every day.',
    type: 'website',
    url: 'https://dataprimetech.com/',
  },
}

const css = `
.dpt {
  font-family: var(--font-inter, 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
  background: #F0F4F8;
  color: #0F172A;
  min-height: 100vh;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  font-size: 15px;
  line-height: 1.5;
}

/* ── Variables ─────────────────────────────────────── */
.dpt {
  --teal: #0E4F54;
  --teal-mid: #1a6b72;
  --teal-light: #e8f4f5;
  --teal-border: rgba(14,79,84,.15);
  --green: #1A7A42;
  --amber: #C9762A;
  --bg: #F0F4F8;
  --surface: #ffffff;
  --surface2: #F8FAFC;
  --border: #E2E8F0;
  --border2: #CBD5E1;
  --text: #0F172A;
  --text2: #475569;
  --text3: #94A3B8;
  --r: 12px;
  --rs: 8px;
  --rx: 16px;
  --shadow: 0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.05);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,.08), 0 2px 4px -1px rgba(0,0,0,.05);
  --shadow-lg: 0 10px 15px -3px rgba(0,0,0,.08), 0 4px 6px -2px rgba(0,0,0,.04);
}

/* ── Reset inside .dpt ─────────────────────────────── */
.dpt *, .dpt *::before, .dpt *::after { box-sizing: border-box; }
.dpt a { color: inherit; text-decoration: none; }
.dpt button { cursor: pointer; font-family: inherit; }
.dpt ul { list-style: none; padding: 0; margin: 0; }

/* ── Nav ───────────────────────────────────────────── */
.dpt nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 50;
  height: 60px; padding: 0 32px;
  display: flex; align-items: center; justify-content: space-between;
  background: rgba(255,255,255,.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
}
.dpt .nav-logo {
  display: flex; align-items: center; gap: 10px; text-decoration: none;
}
.dpt .nav-logo-mark {
  width: 30px; height: 30px; border-radius: 8px;
  background: var(--teal);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.dpt .nav-logo-mark svg { width: 15px; height: 15px; fill: none; stroke: #fff; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
.dpt .nav-logo-name { font-size: 14px; font-weight: 700; color: var(--text); letter-spacing: -.2px; }
.dpt .nav-links { display: flex; gap: 2px; }
.dpt .nav-links a {
  font-size: 13px; font-weight: 500; color: var(--text2);
  padding: 6px 12px; border-radius: var(--rs);
  transition: background .15s, color .15s;
}
.dpt .nav-links a:hover, .dpt .nav-links a.active { background: var(--surface2); color: var(--text); }
.dpt .nav-right { display: flex; align-items: center; gap: 10px; }
.dpt .nav-status {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; font-weight: 600; color: var(--green);
  background: rgba(26,122,66,.08); border: 1px solid rgba(26,122,66,.18);
  padding: 4px 12px; border-radius: 20px;
}
.dpt .nav-status-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); animation: dpt-blink 2.5s infinite; }
@keyframes dpt-blink { 0%,100%{opacity:1} 50%{opacity:.35} }
.dpt .nav-cta {
  padding: 7px 16px; background: var(--teal); color: #fff;
  border: none; border-radius: var(--rs); font-size: 13px; font-weight: 600;
  transition: background .15s;
}
.dpt .nav-cta:hover { background: var(--teal-mid); }
.dpt .nav-hamburger {
  display: none; background: none; border: none; color: var(--text);
  padding: 6px; border-radius: var(--rs); transition: background .15s;
}
.dpt .nav-hamburger:hover { background: var(--surface2); }
.dpt .mobile-nav {
  display: none; position: fixed; top: 60px; left: 0; right: 0; z-index: 49;
  background: rgba(255,255,255,.95); backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
  padding: 12px 20px 16px; flex-direction: column; gap: 4px;
}
.dpt .mobile-nav.open { display: flex; }
.dpt .mobile-nav a { padding: 11px 14px; font-size: 14px; font-weight: 600; border-radius: var(--rs); color: var(--text); transition: background .15s; }
.dpt .mobile-nav a:hover { background: var(--surface2); }
.dpt .mobile-nav-cta { background: var(--teal) !important; color: #fff !important; margin-top: 6px; text-align: center; }
@media (max-width: 640px) {
  .dpt nav { padding: 0 20px; }
  .dpt .nav-links, .dpt .nav-status { display: none; }
  .dpt .nav-cta { display: none; }
  .dpt .nav-hamburger { display: block; }
}

/* ── Layout ─────────────────────────────────────────── */
.dpt .wrap { max-width: 1120px; margin: 0 auto; padding: 0 40px; }
@media (max-width: 640px) { .dpt .wrap { padding: 0 20px; } }
.dpt section { padding: 80px 0; }
@media (max-width: 640px) { .dpt section { padding: 56px 0; } }
.dpt .section-divider { border: none; border-top: 1px solid var(--border); }
.dpt .section-label { font-size: 11px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: var(--teal); margin-bottom: 10px; }
.dpt .section-h { font-size: clamp(26px, 3vw, 36px); font-weight: 800; letter-spacing: -.8px; line-height: 1.15; margin-bottom: 12px; color: var(--text); }
.dpt .section-sub { font-size: 15px; color: var(--text2); line-height: 1.7; max-width: 520px; }

/* ── Buttons ─────────────────────────────────────────── */
.dpt .btn-primary {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 11px 22px; background: var(--teal); color: #fff;
  border: 1.5px solid var(--teal); border-radius: var(--rs);
  font-size: 14px; font-weight: 600; transition: background .15s, transform .12s;
}
.dpt .btn-primary:hover { background: var(--teal-mid); transform: translateY(-1px); }
.dpt .btn-primary svg { width: 15px; height: 15px; fill: none; stroke: #fff; stroke-width: 2.5; transition: transform .2s; }
.dpt .btn-primary:hover svg { transform: translateX(2px); }
.dpt .btn-secondary {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 11px 22px; background: var(--surface); color: var(--text);
  border: 1.5px solid var(--border); border-radius: var(--rs);
  font-size: 14px; font-weight: 600; transition: background .15s, border-color .15s, transform .12s;
}
.dpt .btn-secondary:hover { background: var(--surface2); border-color: var(--border2); transform: translateY(-1px); }

/* ── Hero ─────────────────────────────────────────── */
.dpt .hero {
  max-width: 1120px; margin: 0 auto;
  padding: 120px 40px 80px;
  display: grid; grid-template-columns: 1fr 400px; gap: 64px; align-items: start;
}
@media (max-width: 920px) { .dpt .hero { grid-template-columns: 1fr; gap: 48px; padding: 100px 20px 64px; } }
.dpt .hero-badge {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--teal-light); border: 1px solid var(--teal-border);
  color: var(--teal); font-size: 11px; font-weight: 700;
  letter-spacing: .8px; text-transform: uppercase;
  padding: 5px 12px; border-radius: 20px; margin-bottom: 24px;
}
.dpt .hero-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--teal); animation: dpt-blink 2.5s infinite; }
.dpt .hero-h1 {
  font-size: clamp(38px, 5.5vw, 60px); font-weight: 800;
  letter-spacing: -2px; line-height: 1.06;
  color: var(--text); margin-bottom: 20px;
}
.dpt .hero-h1 em { font-style: normal; color: var(--teal); }
.dpt .hero-p { font-size: 16px; color: var(--text2); line-height: 1.75; max-width: 460px; margin-bottom: 32px; }
.dpt .hero-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 40px; }
.dpt .hero-stats { display: flex; align-items: center; gap: 24px; flex-wrap: wrap; }
.dpt .hero-stat strong { display: block; font-size: 22px; font-weight: 800; letter-spacing: -.5px; color: var(--text); }
.dpt .hero-stat span { font-size: 12px; color: var(--text3); font-weight: 500; }
.dpt .hero-stat-div { width: 1px; height: 28px; background: var(--border2); }

/* Hero panel */
.dpt .hero-panel {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--rx); box-shadow: var(--shadow-lg);
  overflow: hidden; position: sticky; top: 80px;
}
.dpt .hero-panel-hd {
  padding: 16px 20px; border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
  background: var(--surface2);
}
.dpt .hero-panel-hd-title { font-size: 12px; font-weight: 600; color: var(--text2); }
.dpt .panel-dots { display: flex; gap: 5px; }
.dpt .panel-dot { width: 8px; height: 8px; border-radius: 50%; }
.dpt .hero-panel-apps { padding: 12px; display: flex; flex-direction: column; gap: 6px; }
.dpt .app-row {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px; background: var(--surface2);
  border: 1px solid var(--border); border-radius: var(--rs);
  transition: border-color .15s, background .15s;
}
.dpt a.app-row:hover { border-color: var(--teal-border); background: var(--teal-light); }
.dpt .app-icon {
  width: 36px; height: 36px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.dpt .app-icon svg { width: 17px; height: 17px; fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.dpt .app-info { flex: 1; min-width: 0; }
.dpt .app-name { font-size: 13px; font-weight: 600; color: var(--text); }
.dpt .app-sub { font-size: 11px; color: var(--text3); margin-top: 1px; }
.dpt .app-badge {
  font-size: 10px; font-weight: 700; letter-spacing: .3px; text-transform: uppercase;
  padding: 3px 8px; border-radius: 6px; flex-shrink: 0;
}
.dpt .badge-live { background: rgba(26,122,66,.1); color: var(--green); border: 1px solid rgba(26,122,66,.2); }
.dpt .badge-building { background: rgba(201,118,42,.1); color: var(--amber); border: 1px solid rgba(201,118,42,.2); }
.dpt .badge-soon { background: var(--teal-light); color: var(--teal); border: 1px solid var(--teal-border); }
.dpt .hero-panel-footer {
  padding: 12px 18px; border-top: 1px solid var(--border);
  background: var(--surface2); font-size: 11px; color: var(--text3);
  display: flex; align-items: center; gap: 6px;
}
.dpt .hero-panel-footer svg { width: 12px; height: 12px; fill: none; stroke: var(--teal); stroke-width: 2; }

/* ── Why us (3 cards) ─────────────────────────────── */
.dpt .proof-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 40px;
}
@media (max-width: 640px) { .dpt .proof-grid { grid-template-columns: 1fr; } }
.dpt .proof-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--r); padding: 24px; box-shadow: var(--shadow);
  transition: border-color .2s, box-shadow .2s;
}
.dpt .proof-card:hover { border-color: var(--teal-border); box-shadow: var(--shadow-md); }
.dpt .proof-icon {
  width: 40px; height: 40px; border-radius: 10px;
  background: var(--teal-light); border: 1px solid var(--teal-border);
  display: flex; align-items: center; justify-content: center; margin-bottom: 16px;
}
.dpt .proof-icon svg { width: 18px; height: 18px; fill: none; stroke: var(--teal); stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.dpt .proof-title { font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
.dpt .proof-desc { font-size: 13px; color: var(--text2); line-height: 1.7; }

/* ── About ────────────────────────────────────────── */
.dpt .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: start; margin-top: 48px; }
@media (max-width: 820px) { .dpt .about-grid { grid-template-columns: 1fr; gap: 40px; } }
.dpt .about-bio { font-size: 14px; color: var(--text2); line-height: 1.85; }
.dpt .about-bio p + p { margin-top: 16px; }
.dpt .about-bio strong { color: var(--text); font-weight: 600; }
.dpt .founder-row {
  display: flex; align-items: center; gap: 14px;
  margin-top: 28px; padding-top: 20px; border-top: 1px solid var(--border);
}
.dpt .founder-av {
  width: 42px; height: 42px; border-radius: 50%;
  background: var(--teal); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700; flex-shrink: 0;
}
.dpt .founder-name { font-size: 14px; font-weight: 700; color: var(--text); }
.dpt .founder-role { font-size: 12px; color: var(--text3); margin-top: 2px; }

/* About card */
.dpt .about-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--r); padding: 28px; box-shadow: var(--shadow);
}
.dpt .about-card-lbl {
  font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
  color: var(--text3); margin-bottom: 20px;
}
.dpt .about-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
.dpt .about-stat {
  background: var(--surface2); border: 1px solid var(--border);
  border-radius: var(--rs); padding: 16px;
}
.dpt .about-stat-num { font-size: 24px; font-weight: 800; letter-spacing: -.5px; color: var(--text); }
.dpt .about-stat-lbl { font-size: 11px; color: var(--text3); margin-top: 2px; }
.dpt .tech-tags { display: flex; gap: 6px; flex-wrap: wrap; }
.dpt .tech-tag {
  font-size: 11px; font-weight: 600; padding: 4px 12px;
  border-radius: 20px; background: var(--teal-light);
  color: var(--teal); border: 1px solid var(--teal-border);
}

/* ── Spotlight ────────────────────────────────────── */
.dpt .spotlight {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--rx); box-shadow: var(--shadow); overflow: hidden; margin-top: 48px;
}
.dpt .spotlight-inner { display: grid; grid-template-columns: 1fr 1fr; }
@media (max-width: 820px) { .dpt .spotlight-inner { grid-template-columns: 1fr; } }
.dpt .spotlight-left { padding: 48px 44px; border-right: 1px solid var(--border); }
@media (max-width: 820px) { .dpt .spotlight-left { padding: 32px 28px; border-right: none; border-bottom: 1px solid var(--border); } }
.dpt .spotlight-live {
  display: inline-flex; align-items: center; gap: 7px;
  background: rgba(26,122,66,.08); border: 1px solid rgba(26,122,66,.18);
  color: var(--green); font-size: 11px; font-weight: 700;
  letter-spacing: .6px; text-transform: uppercase;
  padding: 4px 12px; border-radius: 20px; margin-bottom: 20px;
}
.dpt .spotlight-live-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--green); animation: dpt-blink 2s infinite; }
.dpt .spotlight-h { font-size: clamp(22px, 2.4vw, 30px); font-weight: 800; letter-spacing: -.6px; line-height: 1.2; margin-bottom: 12px; }
.dpt .spotlight-p { font-size: 13px; color: var(--text2); line-height: 1.75; margin-bottom: 28px; }
.dpt .spotlight-cta {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 20px; background: var(--teal); color: #fff;
  border-radius: var(--rs); font-size: 13px; font-weight: 600;
  transition: background .15s, transform .12s;
}
.dpt .spotlight-cta:hover { background: var(--teal-mid); transform: translateY(-1px); }
.dpt .spotlight-cta svg { width: 13px; height: 13px; fill: none; stroke: #fff; stroke-width: 2.5; transition: transform .2s; }
.dpt .spotlight-cta:hover svg { transform: translateX(2px); }
.dpt .spotlight-right { padding: 28px 32px; display: flex; flex-direction: column; gap: 8px; }
@media (max-width: 820px) { .dpt .spotlight-right { padding: 24px 28px; } }
.dpt .feature-row {
  display: flex; align-items: flex-start; gap: 14px;
  padding: 14px 16px; background: var(--surface2);
  border: 1px solid var(--border); border-radius: var(--rs);
  transition: border-color .15s;
}
.dpt .feature-row:hover { border-color: var(--teal-border); }
.dpt .feature-ico {
  width: 34px; height: 34px; border-radius: 8px;
  background: var(--teal-light); border: 1px solid var(--teal-border);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.dpt .feature-ico svg { width: 15px; height: 15px; fill: none; stroke: var(--teal); stroke-width: 2; stroke-linecap: round; }
.dpt .feature-text strong { display: block; font-size: 12px; font-weight: 700; color: var(--text); margin-bottom: 2px; }
.dpt .feature-text span { font-size: 11px; color: var(--text2); line-height: 1.5; }

/* ── Projects ─────────────────────────────────────── */
.dpt .proj-section-lbl {
  display: flex; align-items: center; gap: 14px; margin-bottom: 14px;
}
.dpt .proj-section-lbl::before, .dpt .proj-section-lbl::after { content: ''; flex: 1; height: 1px; background: var(--border); }
.dpt .proj-section-lbl span { font-size: 11px; font-weight: 700; letter-spacing: .8px; text-transform: uppercase; color: var(--text3); white-space: nowrap; }
.dpt .proj-list { display: flex; flex-direction: column; gap: 10px; }
.dpt .proj {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--r); padding: 22px 24px;
  display: grid; grid-template-columns: 50px 1fr auto; gap: 18px; align-items: center;
  text-decoration: none; box-shadow: var(--shadow);
  transition: border-color .18s, transform .18s;
}
.dpt a.proj:hover { border-color: var(--teal-border); transform: translateX(3px); }
.dpt .proj-dim { opacity: .55; }
.dpt .proj-ico {
  width: 50px; height: 50px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.dpt .proj-ico svg { width: 21px; height: 21px; fill: none; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
.dpt .proj-name { font-size: 15px; font-weight: 700; letter-spacing: -.2px; margin-bottom: 4px; color: var(--text); }
.dpt .proj-desc { font-size: 12px; color: var(--text2); line-height: 1.55; margin-bottom: 10px; }
.dpt .proj-tags { display: flex; gap: 5px; flex-wrap: wrap; }
.dpt .proj-tag {
  font-size: 10px; padding: 2px 8px; border-radius: 4px;
  background: var(--surface2); color: var(--text3); border: 1px solid var(--border);
}
.dpt .proj-right { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; flex-shrink: 0; }
@media (max-width: 560px) { .dpt .proj-right { display: none; } }
.dpt .proj-status-live { font-size: 10px; font-weight: 700; letter-spacing: .4px; text-transform: uppercase; padding: 3px 10px; border-radius: 20px; background: rgba(26,122,66,.1); color: var(--green); border: 1px solid rgba(26,122,66,.2); }
.dpt .proj-status-building { font-size: 10px; font-weight: 700; letter-spacing: .4px; text-transform: uppercase; padding: 3px 10px; border-radius: 20px; background: rgba(201,118,42,.1); color: var(--amber); border: 1px solid rgba(201,118,42,.2); }
.dpt .proj-arr {
  width: 30px; height: 30px; border-radius: 50%;
  border: 1px solid var(--border); display: flex; align-items: center; justify-content: center;
  transition: background .18s, border-color .18s;
}
.dpt a.proj:hover .proj-arr { background: var(--teal); border-color: var(--teal); }
.dpt .proj-arr svg { width: 11px; height: 11px; fill: none; stroke: var(--text3); stroke-width: 2.5; transition: stroke .18s; }
.dpt a.proj:hover .proj-arr svg { stroke: #fff; }
/* Skeleton */
.dpt .proj-skel {
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--r);
  padding: 22px 24px; display: grid; grid-template-columns: 50px 1fr; gap: 18px; align-items: center;
}
.dpt .skel { background: var(--surface2); border-radius: 6px; animation: dpt-shimmer 1.4s ease infinite; }
@keyframes dpt-shimmer { 0%,100%{opacity:.45} 50%{opacity:.9} }
.dpt .skel-ico { width: 50px; height: 50px; border-radius: 12px; }
.dpt .skel-line { height: 11px; margin-bottom: 8px; border-radius: 4px; }
.dpt .skel-w60 { width: 60%; }
.dpt .skel-w80 { width: 80%; }

/* ── Services ─────────────────────────────────────── */
.dpt .svc-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-top: 40px;
}
@media (max-width: 640px) { .dpt .svc-grid { grid-template-columns: 1fr; } }
.dpt .svc-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--r); padding: 28px; box-shadow: var(--shadow);
  transition: border-color .2s, box-shadow .2s;
}
.dpt .svc-card:hover { border-color: var(--teal-border); box-shadow: var(--shadow-md); }
.dpt .svc-num { font-size: 10px; font-weight: 700; letter-spacing: 1px; color: var(--text3); margin-bottom: 16px; }
.dpt .svc-ico {
  width: 44px; height: 44px; border-radius: 10px;
  background: var(--teal-light); border: 1px solid var(--teal-border);
  display: flex; align-items: center; justify-content: center; margin-bottom: 16px;
}
.dpt .svc-ico svg { width: 20px; height: 20px; fill: none; stroke: var(--teal); stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.dpt .svc-name { font-size: 16px; font-weight: 700; letter-spacing: -.3px; margin-bottom: 8px; color: var(--text); }
.dpt .svc-desc { font-size: 13px; color: var(--text2); line-height: 1.7; margin-bottom: 16px; }
.dpt .svc-items { display: flex; flex-direction: column; gap: 6px; }
.dpt .svc-item { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text3); }
.dpt .svc-item::before { content: ''; width: 5px; height: 5px; border-radius: 50%; background: var(--teal); flex-shrink: 0; opacity: .7; }

/* ── Process ──────────────────────────────────────── */
.dpt .steps-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; margin-top: 48px; position: relative; }
@media (max-width: 640px) { .dpt .steps-grid { grid-template-columns: 1fr 1fr; gap: 1px; background: var(--border); border-radius: var(--r); overflow: hidden; } }
.dpt .steps-grid::before {
  content: ''; position: absolute; top: 21px;
  left: calc(12.5% + 10px); right: calc(12.5% + 10px);
  height: 1px; background: var(--border); z-index: 0;
}
@media (max-width: 640px) { .dpt .steps-grid::before { display: none; } }
.dpt .step { padding: 0 20px 0 0; position: relative; z-index: 1; }
@media (max-width: 640px) { .dpt .step { padding: 20px; background: var(--surface); } }
.dpt .step-num {
  width: 42px; height: 42px; border-radius: 50%;
  border: 1.5px solid var(--border); background: var(--surface);
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 800; color: var(--text3);
  margin-bottom: 18px;
}
.dpt .step-num.active { background: var(--teal); border-color: var(--teal); color: #fff; }
.dpt .step-title { font-size: 14px; font-weight: 700; letter-spacing: -.2px; margin-bottom: 6px; color: var(--text); }
.dpt .step-desc { font-size: 12px; color: var(--text2); line-height: 1.65; }

/* ── CTA ──────────────────────────────────────────── */
.dpt .cta-section { background: linear-gradient(135deg, var(--teal) 0%, var(--teal-mid) 60%, #0a3a3f 100%); border-radius: var(--rx); padding: 72px 56px; text-align: center; position: relative; overflow: hidden; margin: 0 40px; }
@media (max-width: 640px) { .dpt .cta-section { margin: 0 20px; padding: 48px 28px; } }
.dpt .cta-section::before { content: ''; position: absolute; width: 360px; height: 360px; border-radius: 50%; background: rgba(255,255,255,.04); top: -100px; right: -80px; }
.dpt .cta-section::after { content: ''; position: absolute; width: 260px; height: 260px; border-radius: 50%; background: rgba(255,255,255,.03); bottom: -80px; left: -60px; }
.dpt .cta-section > * { position: relative; z-index: 1; }
.dpt .cta-h { font-size: clamp(28px, 4vw, 40px); font-weight: 800; letter-spacing: -1.2px; color: #fff; margin-bottom: 12px; }
.dpt .cta-p { font-size: 15px; color: rgba(255,255,255,.7); line-height: 1.7; max-width: 460px; margin: 0 auto 32px; }
.dpt .cta-actions { display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; }
.dpt .btn-cta {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 12px 26px; background: #fff; color: var(--teal);
  border: none; border-radius: var(--rs); font-size: 14px; font-weight: 700;
  box-shadow: 0 4px 20px rgba(0,0,0,.15); transition: transform .15s, box-shadow .15s;
}
.dpt .btn-cta:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,.2); }
.dpt .btn-cta svg { width: 14px; height: 14px; fill: none; stroke: var(--teal); stroke-width: 2.5; transition: transform .2s; }
.dpt .btn-cta:hover svg { transform: translateX(2px); }
.dpt .btn-cta-ghost {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 12px 24px; background: rgba(255,255,255,.1); color: #fff;
  border: 1px solid rgba(255,255,255,.25); border-radius: var(--rs);
  font-size: 14px; font-weight: 600; transition: background .15s, transform .12s;
}
.dpt .btn-cta-ghost:hover { background: rgba(255,255,255,.18); transform: translateY(-1px); }

/* ── Footer ───────────────────────────────────────── */
.dpt footer {
  border-top: 1px solid var(--border); padding: 28px 40px; margin-top: 80px;
}
@media (max-width: 640px) { .dpt footer { padding: 24px 20px; margin-top: 56px; } }
.dpt .footer-inner {
  max-width: 1120px; margin: 0 auto;
  display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;
}
.dpt .footer-logo { display: flex; align-items: center; gap: 8px; }
.dpt .footer-logo-mark {
  width: 22px; height: 22px; background: var(--teal);
  border-radius: 6px; display: flex; align-items: center; justify-content: center;
}
.dpt .footer-logo-mark svg { width: 11px; height: 11px; fill: none; stroke: #fff; stroke-width: 2.5; stroke-linecap: round; }
.dpt .footer-logo-name { font-size: 13px; font-weight: 700; color: var(--text2); }
.dpt .footer-links { display: flex; gap: 20px; }
.dpt .footer-links a { font-size: 12px; color: var(--text3); transition: color .15s; }
.dpt .footer-links a:hover { color: var(--text2); }
.dpt .footer-copy { font-size: 12px; color: var(--text3); }

/* ── Animations ───────────────────────────────────── */
@keyframes dpt-fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
.dpt .fade-up { animation: dpt-fadeUp .5s ease both; }
.dpt .fade-1 { animation-delay: .05s; }
.dpt .fade-2 { animation-delay: .12s; }
.dpt .fade-3 { animation-delay: .2s; }
.dpt .fade-4 { animation-delay: .28s; }
.dpt .fade-5 { animation-delay: .36s; }
`

const clientJs = `
(function(){
  // Mobile menu toggle
  var btn = document.getElementById('dptMenuBtn');
  var menu = document.getElementById('dptMobileMenu');
  if (btn && menu) {
    btn.addEventListener('click', function(){
      var open = menu.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });
    menu.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){
        menu.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Project icons
  var ICONS = {
    clipboard: '<rect x="9" y="2" width="6" height="4" rx="1"/><path d="M8 6H6a2 2 0 00-2 2v11a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-2"/><path d="M12 12v4M10 14h4"/>',
    dollar: '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>',
    briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>',
    map: '<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>',
    code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
  };

  var FALLBACK = [
    { name:'CuraLog', description:'Full medication management platform for caregivers and care teams. Multi-patient support, refill tracking, provider lookup, and role-based access.', tags:['Healthcare','2FA Secured','Multi-patient'], status:'live', icon:'clipboard', color:'#0E4F54', url:'/medicationtracker' },
    { name:'Finance Tracker', description:'Personal finance dashboard for tracking credit cards, subscriptions, and bills. Debt payoff calculator and utilization alerts.', tags:['Finance','Dashboard','Alerts'], status:'live', icon:'dollar', color:'#1A7A42', url:'/finance' },
    { name:'Client Portal', description:'Private project delivery and file-sharing portal for DataPrimeTech clients. Milestone tracking, feedback threads, and secure document handoff.', tags:['Workflow','Collaboration','Security'], status:'building', icon:'briefcase', color:'#C9762A', url:null },
    { name:'Field Ops Tracker', description:'Job scheduling and crew management tool for small field-service businesses. Work orders, photo logs, and invoice generation.', tags:['Operations','Scheduling','Mobile'], status:'building', icon:'map', color:'#5B3BA8', url:null },
  ];

  function statusBadge(s) {
    if (s === 'live') return '<span class="proj-status-live">Live</span>';
    return '<span class="proj-status-building">Building</span>';
  }

  function renderList(projects, elId, statuses) {
    var items = projects.filter(function(p){ return statuses.includes(p.status); });
    var el = document.getElementById(elId);
    if (!el) return;
    if (!items.length) { el.innerHTML = ''; return; }
    el.innerHTML = items.map(function(p){
      var isLive = p.status === 'live';
      var icon = ICONS[p.icon] || ICONS.code;
      var bg = p.color + '18'; var br = p.color + '30';
      var tag = isLive ? 'a href="' + p.url + '" target="_blank" rel="noopener"' : 'div';
      return '<' + tag + ' class="proj' + (isLive ? '' : ' proj-dim') + '">'
        + '<div class="proj-ico" style="background:' + bg + ';border:1px solid ' + br + '">'
        + '<svg viewBox="0 0 24 24" fill="none" stroke="' + p.color + '" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + icon + '</svg></div>'
        + '<div><div class="proj-name">' + p.name + '</div>'
        + '<div class="proj-desc">' + p.description + '</div>'
        + '<div class="proj-tags">' + p.tags.map(function(t){ return '<span class="proj-tag">' + t + '</span>'; }).join('') + '</div></div>'
        + '<div class="proj-right">' + statusBadge(p.status)
        + (isLive ? '<div class="proj-arr"><svg viewBox="0 0 24 24" fill="none" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>' : '')
        + '</div>'
        + '</' + (isLive ? 'a' : 'div') + '>';
    }).join('');
    var liveCount = document.getElementById('dptLiveCount');
    if (liveCount) liveCount.textContent = String(projects.filter(function(p){ return p.status === 'live'; }).length);
  }

  fetch('/projects.json', { cache: 'no-store' })
    .then(function(r){ return r.ok ? r.json() : Promise.reject(); })
    .then(function(data){
      renderList(data, 'dptLiveList', ['live']);
      renderList(data, 'dptWipList', ['building', 'soon']);
    })
    .catch(function(){
      renderList(FALLBACK, 'dptLiveList', ['live']);
      renderList(FALLBACK, 'dptWipList', ['building', 'soon']);
    });
})();
`

export default function DataPrimeTechHome() {
  return (
    <div className={`dpt ${inter.variable}`}>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* Nav */}
      <nav>
        <a href="/" className="nav-logo" aria-label="DataPrimeTech home">
          <div className="nav-logo-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
          </div>
          <span className="nav-logo-name">DataPrimeTech</span>
        </a>

        <nav className="nav-links" aria-label="Primary navigation">
          <a href="/" className="active">Home</a>
          <a href="#projects">Projects</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>

        <div className="nav-right">
          <div className="nav-status" aria-label="Currently accepting new projects">
            <span className="nav-status-dot" aria-hidden="true"></span>
            Available
          </div>
          <a href="#contact" className="nav-cta">Get in touch</a>
        </div>

        <button
          className="nav-hamburger"
          id="dptMenuBtn"
          aria-label="Toggle navigation"
          aria-expanded="false"
          aria-controls="dptMobileMenu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </nav>

      <div className="mobile-nav" id="dptMobileMenu" role="navigation" aria-label="Mobile navigation">
        <a href="/">Home</a>
        <a href="#projects">Projects</a>
        <a href="#about">About</a>
        <a href="#contact" className="mobile-nav-cta">Get in touch</a>
      </div>

      <main>
        {/* ── Hero ── */}
        <div className="hero">
          <div>
            <div className="hero-badge fade-up">
              <span className="hero-badge-dot" aria-hidden="true"></span>
              Custom Web Development
            </div>
            <h1 className="hero-h1 fade-up fade-1">
              Software built<br/>
              for how you<br/>
              <em>actually work.</em>
            </h1>
            <p className="hero-p fade-up fade-2">
              We design and build secure, fast web applications from scratch — no templates, no shortcuts.
              If you have a problem worth solving, we&apos;ll build the tool to solve it.
            </p>
            <div className="hero-actions fade-up fade-3">
              <a href="/medicationtracker" className="btn-primary">
                See CuraLog live
                <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
              <a href="#contact" className="btn-secondary">Start a project</a>
            </div>
            <div className="hero-stats fade-up fade-4">
              <div className="hero-stat">
                <strong id="dptLiveCount">2</strong>
                <span>Live apps</span>
              </div>
              <div className="hero-stat-div" aria-hidden="true"></div>
              <div className="hero-stat">
                <strong>100%</strong>
                <span>Custom built</span>
              </div>
              <div className="hero-stat-div" aria-hidden="true"></div>
              <div className="hero-stat">
                <strong>2FA</strong>
                <span>Secured</span>
              </div>
            </div>
          </div>

          {/* Product panel */}
          <div className="fade-up fade-5">
            <div className="hero-panel">
              <div className="hero-panel-hd">
                <span className="hero-panel-hd-title">All products</span>
                <div className="panel-dots" aria-hidden="true">
                  <div className="panel-dot" style={{ background: '#F87171' }}></div>
                  <div className="panel-dot" style={{ background: '#FBBF24' }}></div>
                  <div className="panel-dot" style={{ background: '#34D399' }}></div>
                </div>
              </div>
              <div className="hero-panel-apps">
                <a href="/medicationtracker" className="app-row">
                  <div className="app-icon" style={{ background: 'rgba(14,79,84,.1)', border: '1px solid rgba(14,79,84,.18)' }} aria-hidden="true">
                    <svg viewBox="0 0 24 24" stroke="#0E4F54"><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M8 6H6a2 2 0 00-2 2v11a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-2"/><path d="M12 12v4M10 14h4"/></svg>
                  </div>
                  <div className="app-info">
                    <div className="app-name">CuraLog</div>
                    <div className="app-sub">Medication &amp; care management</div>
                  </div>
                  <span className="app-badge badge-live">Live</span>
                </a>
                <a href="/finance" className="app-row">
                  <div className="app-icon" style={{ background: 'rgba(26,122,66,.08)', border: '1px solid rgba(26,122,66,.18)' }} aria-hidden="true">
                    <svg viewBox="0 0 24 24" stroke="#1A7A42"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                  </div>
                  <div className="app-info">
                    <div className="app-name">Finance Tracker</div>
                    <div className="app-sub">Cards · Subscriptions · Debt payoff</div>
                  </div>
                  <span className="app-badge badge-live">Live</span>
                </a>
                <div className="app-row">
                  <div className="app-icon" style={{ background: 'rgba(201,118,42,.08)', border: '1px solid rgba(201,118,42,.18)' }} aria-hidden="true">
                    <svg viewBox="0 0 24 24" stroke="#C9762A"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
                  </div>
                  <div className="app-info">
                    <div className="app-name">Client Portal</div>
                    <div className="app-sub">Project delivery &amp; file handoff</div>
                  </div>
                  <span className="app-badge badge-building">Building</span>
                </div>
                <div className="app-row">
                  <div className="app-icon" style={{ background: 'rgba(91,59,168,.08)', border: '1px solid rgba(91,59,168,.18)' }} aria-hidden="true">
                    <svg viewBox="0 0 24 24" stroke="#5B3BA8"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
                  </div>
                  <div className="app-info">
                    <div className="app-name">Field Ops Tracker</div>
                    <div className="app-sub">Job scheduling &amp; crew management</div>
                  </div>
                  <span className="app-badge badge-soon">Soon</span>
                </div>
              </div>
              <div className="hero-panel-footer">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                2FA secured · Cloud synced · Cross-device
              </div>
            </div>
          </div>
        </div>

        <hr className="section-divider" />

        {/* ── Why us ── */}
        <section aria-labelledby="why-heading">
          <div className="wrap">
            <div className="section-label">Why DataPrimeTech</div>
            <h2 id="why-heading" className="section-h">Practical software,<br/>not demos.</h2>
            <p className="section-sub">Every app we ship is live, used daily, and built around a real workflow — not a portfolio piece.</p>
            <div className="proof-grid">
              {[
                { icon: 'M22 11.08V12a10 10 0 11-5.93-9.14 M22 4 12 14.01 9 11.01', title: 'Real workflows', desc: "Designed around actual day-to-day tasks, not generic templates. If it doesn't solve a real problem, we don't ship it." },
                { icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', title: 'Security first', desc: 'Authentication, role-based access, and private data handling built in from day one — never bolted on later.' },
                { icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z', title: 'Fast iteration', desc: 'New features and fixes ship quickly without rearchitecting everything. We maintain what we build, long-term.' },
              ].map(c => (
                <div key={c.title} className="proof-card">
                  <div className="proof-icon">
                    <svg viewBox="0 0 24 24"><path d={c.icon}/></svg>
                  </div>
                  <div className="proof-title">{c.title}</div>
                  <p className="proof-desc">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <hr className="section-divider" />

        {/* ── About ── */}
        <section id="about" aria-labelledby="about-heading">
          <div className="wrap">
            <div className="section-label">About</div>
            <h2 id="about-heading" className="section-h">Who we are.</h2>
            <div className="about-grid">
              <div>
                <div className="about-bio">
                  <p><strong>DataPrimeTech</strong> is a boutique software studio focused on building custom web applications for individuals, small teams, and growing businesses.</p>
                  <p>We don&apos;t sell templates, adapters, or off-the-shelf tools. Every project starts from a blank canvas and is designed specifically around how you and your team actually work — your terminology, your workflow, your edge cases.</p>
                  <p>We care about craft. That means clean architecture, real security, thoughtful UX, and software that&apos;s maintainable long after launch. No technical debt handed to you on day one.</p>
                  <p>Our products are used daily by real people solving real problems. That&apos;s the bar we hold every build to.</p>
                </div>
                <div className="founder-row">
                  <div className="founder-av" aria-hidden="true">JD</div>
                  <div>
                    <div className="founder-name">Joseph Diaz-Ordonez</div>
                    <div className="founder-role">Founder &amp; Developer · DataPrimeTech</div>
                  </div>
                </div>
              </div>
              <div>
                <div className="about-card">
                  <div className="about-card-lbl">By the numbers</div>
                  <div className="about-stats">
                    <div className="about-stat"><div className="about-stat-num">2</div><div className="about-stat-lbl">Live apps</div></div>
                    <div className="about-stat"><div className="about-stat-num">2</div><div className="about-stat-lbl">In progress</div></div>
                    <div className="about-stat"><div className="about-stat-num">100%</div><div className="about-stat-lbl">Custom built</div></div>
                    <div className="about-stat"><div className="about-stat-num">0</div><div className="about-stat-lbl">Templates used</div></div>
                  </div>
                  <div className="tech-tags">
                    {['TypeScript', 'React', 'PostgreSQL', 'Node.js', 'REST APIs', 'Cloud Hosted'].map(t => (
                      <span key={t} className="tech-tag">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <hr className="section-divider" />

        {/* ── CuraLog Spotlight ── */}
        <section aria-labelledby="spotlight-heading">
          <div className="wrap">
            <div className="section-label">Featured project</div>
            <h2 id="spotlight-heading" className="section-h">CuraLog — medication<br/>management that works.</h2>
            <p className="section-sub">Our most comprehensive app. Built for caregivers, patients, and providers who need more than a reminder.</p>
            <div className="spotlight">
              <div className="spotlight-inner">
                <div className="spotlight-left">
                  <div className="spotlight-live">
                    <span className="spotlight-live-dot" aria-hidden="true"></span>
                    Live now
                  </div>
                  <h3 className="spotlight-h">Multi-patient care,<br/>built for real teams.</h3>
                  <p className="spotlight-p">CuraLog is a full medication management platform with caregiver portals, refill tracking, provider lookup, and secure messaging — all in one place.</p>
                  <a href="/medicationtracker" className="spotlight-cta">
                    Open CuraLog
                    <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </a>
                </div>
                <div className="spotlight-right">
                  {[
                    { icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z', title: 'Multi-patient support', desc: 'Manage medications across multiple patients from one dashboard' },
                    { icon: 'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0', title: 'Refill alerts', desc: 'Smart reminders before medications run out, with request workflows' },
                    { icon: 'M3 11h18v11H3zM7 11V7a5 5 0 0110 0v4', title: 'Role-based access', desc: 'Owners, helpers, patients, and providers each see what they need' },
                    { icon: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z', title: 'Secure messaging', desc: 'In-app messaging between caregivers, patients, and care team members' },
                    { icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', title: '2FA secured portal', desc: 'TOTP authentication, encrypted storage, and full audit logging' },
                  ].map(f => (
                    <div key={f.title} className="feature-row">
                      <div className="feature-ico">
                        <svg viewBox="0 0 24 24"><path d={f.icon}/></svg>
                      </div>
                      <div className="feature-text">
                        <strong>{f.title}</strong>
                        <span>{f.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <hr className="section-divider" />

        {/* ── Projects ── */}
        <section id="projects" aria-labelledby="projects-heading">
          <div className="wrap">
            <div className="section-label">Projects</div>
            <h2 id="projects-heading" className="section-h">What we&apos;ve built<br/>and what&apos;s next.</h2>
            <p className="section-sub" style={{ marginBottom: 0 }}>Real apps solving real problems — used every day, and more on the way.</p>

            <div className="proj-section-lbl" style={{ marginTop: 40 }}>
              <span>Live now</span>
            </div>
            <div className="proj-list" id="dptLiveList" aria-live="polite">
              <div className="proj-skel">
                <div className="skel skel-ico"></div>
                <div><div className="skel skel-line skel-w60"></div><div className="skel skel-line skel-w80"></div></div>
              </div>
            </div>

            <div className="proj-section-lbl" style={{ marginTop: 32 }}>
              <span>Currently building</span>
            </div>
            <div className="proj-list" id="dptWipList" aria-live="polite">
              <div className="proj-skel">
                <div className="skel skel-ico"></div>
                <div><div className="skel skel-line skel-w60"></div><div className="skel skel-line skel-w80"></div></div>
              </div>
            </div>
          </div>
        </section>

        <hr className="section-divider" />

        {/* ── Services ── */}
        <section aria-labelledby="services-heading">
          <div className="wrap">
            <div className="section-label">What we do</div>
            <h2 id="services-heading" className="section-h">Built for your<br/>exact use case.</h2>
            <p className="section-sub">Every app is designed from scratch around what you actually need — not adapted from something generic.</p>
            <div className="svc-grid">
              {[
                { num:'01', icon:'M2 3h20v14H2zM8 21h8M12 17v4', name:'Web Applications', desc:'Full custom apps built from the ground up. Fast, secure, and designed to work on every device.', items:['Password-protected with two-factor auth','Cloud database — syncs in real time','Works on any screen size'] },
                { num:'02', icon:'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', name:'Secure Private Tools', desc:'For sensitive data. Built with real security layers — TOTP auth, encrypted storage, session management.', items:['TOTP two-factor authentication','Role-based access for teams','Works with 1Password, Authy, Google Auth'] },
                { num:'03', icon:'M22 12h-4l-3 9L9 3l-3 9H2', name:'Tracking & Automation', desc:'Apps that do the work for you. Auto-calculations, smart alerts, status tracking, and data that updates live.', items:['Auto-calculated fields and schedules','Email and SMS notifications','Real-time sync across all users'] },
                { num:'04', icon:'M12 2a10 10 0 100 20A10 10 0 0012 2zM2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20', name:'Websites & Pages', desc:'Clean, professional websites that load fast. No page builders — built from scratch with your brand in mind.', items:['Custom design, no templates','Dark mode support','Deployed globally on enterprise-grade CDN'] },
              ].map(s => (
                <div key={s.num} className="svc-card">
                  <div className="svc-num">{s.num}</div>
                  <div className="svc-ico">
                    <svg viewBox="0 0 24 24"><path d={s.icon}/></svg>
                  </div>
                  <div className="svc-name">{s.name}</div>
                  <div className="svc-desc">{s.desc}</div>
                  <ul className="svc-items">
                    {s.items.map(i => <li key={i} className="svc-item">{i}</li>)}
                  </ul>
                </div>
              ))}
            </div>

            {/* Process */}
            <div style={{ marginTop: 72 }}>
              <div className="section-label">The process</div>
              <h2 className="section-h" style={{ marginBottom: 0 }}>From idea to live<br/>in four steps.</h2>
            </div>
            <div className="steps-grid">
              {[
                { n:'01', active:true, title:'Discover', desc:'Tell us what you need. We ask the right questions to understand the problem before touching code.' },
                { n:'02', active:false, title:'Design', desc:"We map out the structure and flow. You see what it'll look like before anything is built." },
                { n:'03', active:false, title:'Build', desc:"Clean code from scratch. No templates, no bloat. Built exactly for your use case." },
                { n:'04', active:false, title:'Launch', desc:'Live on your domain in minutes. Updates deploy in under 30 seconds whenever you need a change.' },
              ].map(s => (
                <div key={s.n} className="step">
                  <div className={`step-num${s.active ? ' active' : ''}`}>{s.n}</div>
                  <div className="step-title">{s.title}</div>
                  <div className="step-desc">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section id="contact" style={{ paddingTop: 0 }} aria-labelledby="cta-heading">
          <div className="cta-section">
            <h2 id="cta-heading" className="cta-h">Have an idea?<br/>Let&apos;s build it.</h2>
            <p className="cta-p">Whether it&apos;s a tool for your team, a personal project, or something you&apos;ve never seen built before — if you can describe it, we can build it.</p>
            <div className="cta-actions">
              <a href="mailto:joseph@dataprimetech.com" className="btn-cta">
                Send us a message
                <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
              <a href="/medicationtracker" className="btn-cta-ghost">View CuraLog</a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer>
        <div className="footer-inner">
          <div className="footer-logo">
            <div className="footer-logo-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            </div>
            <span className="footer-logo-name">DataPrimeTech</span>
          </div>
          <div className="footer-links">
            <a href="#projects">Projects</a>
            <a href="#about">About</a>
            <a href="mailto:joseph@dataprimetech.com">Contact</a>
            <a href="/medicationtracker">CuraLog</a>
          </div>
          <span className="footer-copy">© 2026 DataPrimeTech</span>
        </div>
      </footer>

      <Script id="dpt-home" strategy="afterInteractive">{clientJs}</Script>
    </div>
  )
}
