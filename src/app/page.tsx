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
.dpt {
  --teal: #0E4F54;
  --teal-mid: #1a6b72;
  --teal-light: #e8f4f5;
  --teal-border: rgba(14,79,84,.15);
  --green: #1A7A42;
  --amber: #C9762A;
  --indigo: #4F6EF7;
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
.dpt *, .dpt *::before, .dpt *::after { box-sizing: border-box; }
.dpt a { color: inherit; text-decoration: none; }
.dpt button { cursor: pointer; font-family: inherit; }
.dpt ul { list-style: none; padding: 0; margin: 0; }

/* ── Nav ── */
.dpt nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 50;
  height: 60px; padding: 0 32px;
  display: flex; align-items: center; justify-content: space-between;
  background: rgba(255,255,255,.92);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
}
.dpt .nav-logo { display: flex; align-items: center; gap: 10px; }
.dpt .nav-logo-mark { width: 30px; height: 30px; border-radius: 8px; background: var(--teal); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.dpt .nav-logo-mark svg { width: 15px; height: 15px; fill: none; stroke: #fff; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
.dpt .nav-logo-name { font-size: 14px; font-weight: 700; color: var(--text); letter-spacing: -.2px; }
.dpt .nav-links { display: flex; gap: 2px; }
.dpt .nav-links a { font-size: 13px; font-weight: 500; color: var(--text2); padding: 6px 12px; border-radius: var(--rs); transition: background .15s, color .15s; }
.dpt .nav-links a:hover, .dpt .nav-links a.active { background: var(--surface2); color: var(--text); }
.dpt .nav-right { display: flex; align-items: center; gap: 10px; }
.dpt .nav-status { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: var(--green); background: rgba(26,122,66,.08); border: 1px solid rgba(26,122,66,.18); padding: 4px 12px; border-radius: 20px; }
.dpt .nav-status-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); animation: dpt-blink 2.5s infinite; }
@keyframes dpt-blink { 0%,100%{opacity:1} 50%{opacity:.35} }
.dpt .nav-cta { padding: 7px 16px; background: var(--teal); color: #fff; border: none; border-radius: var(--rs); font-size: 13px; font-weight: 600; transition: background .15s; }
.dpt .nav-cta:hover { background: var(--teal-mid); }
.dpt .nav-hamburger { display: none; background: none; border: none; color: var(--text); padding: 6px; border-radius: var(--rs); transition: background .15s; }
.dpt .nav-hamburger:hover { background: var(--surface2); }
.dpt .mobile-nav { display: none; position: fixed; top: 60px; left: 0; right: 0; z-index: 49; background: rgba(255,255,255,.95); backdrop-filter: blur(20px); border-bottom: 1px solid var(--border); padding: 12px 20px 16px; flex-direction: column; gap: 4px; }
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

/* ── Layout ── */
.dpt .wrap { max-width: 1120px; margin: 0 auto; padding: 0 40px; }
@media (max-width: 640px) { .dpt .wrap { padding: 0 20px; } }
.dpt section { padding: 80px 0; }
@media (max-width: 640px) { .dpt section { padding: 56px 0; } }
.dpt .section-divider { border: none; border-top: 1px solid var(--border); }
.dpt .section-label { font-size: 11px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: var(--teal); margin-bottom: 10px; }
.dpt .section-h { font-size: clamp(26px, 3vw, 36px); font-weight: 800; letter-spacing: -.8px; line-height: 1.15; margin-bottom: 12px; color: var(--text); }
.dpt .section-sub { font-size: 15px; color: var(--text2); line-height: 1.7; max-width: 520px; }

/* ── Hero ── */
.dpt .hero { max-width: 1120px; margin: 0 auto; padding: 120px 40px 80px; }
@media (max-width: 640px) { .dpt .hero { padding: 100px 20px 64px; } }
.dpt .hero-badge { display: inline-flex; align-items: center; gap: 8px; background: var(--teal-light); border: 1px solid var(--teal-border); color: var(--teal); font-size: 11px; font-weight: 700; letter-spacing: .8px; text-transform: uppercase; padding: 5px 12px; border-radius: 20px; margin-bottom: 24px; }
.dpt .hero-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--teal); animation: dpt-blink 2.5s infinite; }
.dpt .hero-h1 { font-size: clamp(38px, 5.5vw, 60px); font-weight: 800; letter-spacing: -2px; line-height: 1.06; color: var(--text); margin-bottom: 20px; }
.dpt .hero-h1 em { font-style: normal; color: var(--teal); }
.dpt .hero-p { font-size: 16px; color: var(--text2); line-height: 1.75; max-width: 540px; margin-bottom: 32px; }
.dpt .hero-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 40px; }
.dpt .hero-stats { display: flex; align-items: center; gap: 24px; flex-wrap: wrap; }
.dpt .hero-stat strong { display: block; font-size: 22px; font-weight: 800; letter-spacing: -.5px; color: var(--text); }
.dpt .hero-stat span { font-size: 12px; color: var(--text3); font-weight: 500; }
.dpt .hero-stat-div { width: 1px; height: 28px; background: var(--border2); }

/* ── Buttons ── */
.dpt .btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 11px 22px; background: var(--teal); color: #fff; border: 1.5px solid var(--teal); border-radius: var(--rs); font-size: 14px; font-weight: 600; transition: background .15s, transform .12s; }
.dpt .btn-primary:hover { background: var(--teal-mid); transform: translateY(-1px); }
.dpt .btn-primary svg { width: 15px; height: 15px; fill: none; stroke: #fff; stroke-width: 2.5; transition: transform .2s; }
.dpt .btn-primary:hover svg { transform: translateX(2px); }
.dpt .btn-secondary { display: inline-flex; align-items: center; gap: 8px; padding: 11px 22px; background: var(--surface); color: var(--text); border: 1.5px solid var(--border); border-radius: var(--rs); font-size: 14px; font-weight: 600; transition: background .15s, border-color .15s, transform .12s; }
.dpt .btn-secondary:hover { background: var(--surface2); border-color: var(--border2); transform: translateY(-1px); }

/* ── Why us ── */
.dpt .proof-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 40px; }
@media (max-width: 640px) { .dpt .proof-grid { grid-template-columns: 1fr; } }
.dpt .proof-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); padding: 24px; box-shadow: var(--shadow); transition: border-color .2s, box-shadow .2s; }
.dpt .proof-card:hover { border-color: var(--teal-border); box-shadow: var(--shadow-md); }
.dpt .proof-icon { width: 40px; height: 40px; border-radius: 10px; background: var(--teal-light); border: 1px solid var(--teal-border); display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
.dpt .proof-icon svg { width: 18px; height: 18px; fill: none; stroke: var(--teal); stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.dpt .proof-title { font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
.dpt .proof-desc { font-size: 13px; color: var(--text2); line-height: 1.7; }

/* ── Projects Grid (equal cards) ── */
.dpt .pcard-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 48px; }
@media (max-width: 820px) { .dpt .pcard-grid { grid-template-columns: 1fr; } }
.dpt .pcard {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--rx); overflow: hidden;
  box-shadow: var(--shadow); display: flex; flex-direction: column;
  transition: box-shadow .2s, transform .2s, border-color .2s;
}
.dpt .pcard:hover { box-shadow: var(--shadow-lg); transform: translateY(-2px); }
.dpt a.pcard:hover { border-color: rgba(0,0,0,.12); }
.dpt .pcard-header { padding: 28px 28px 20px; position: relative; overflow: hidden; }
.dpt .pcard-header::after { content: ''; position: absolute; width: 180px; height: 180px; border-radius: 50%; background: rgba(255,255,255,.07); top: -60px; right: -60px; pointer-events: none; }
.dpt .pcard-header-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 18px; }
.dpt .pcard-icon { width: 52px; height: 52px; border-radius: 14px; background: rgba(255,255,255,.18); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.dpt .pcard-icon svg { width: 24px; height: 24px; fill: none; stroke: #fff; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
.dpt .pcard-badge-live { display: inline-flex; align-items: center; gap: 5px; background: rgba(255,255,255,.2); border: 1px solid rgba(255,255,255,.3); color: #fff; font-size: 10px; font-weight: 700; letter-spacing: .5px; text-transform: uppercase; padding: 4px 10px; border-radius: 20px; }
.dpt .pcard-badge-live-dot { width: 5px; height: 5px; border-radius: 50%; background: #fff; animation: dpt-blink 2s infinite; }
.dpt .pcard-badge-building { display: inline-flex; align-items: center; gap: 5px; background: rgba(0,0,0,.15); border: 1px solid rgba(255,255,255,.15); color: rgba(255,255,255,.7); font-size: 10px; font-weight: 700; letter-spacing: .5px; text-transform: uppercase; padding: 4px 10px; border-radius: 20px; }
.dpt .pcard-name { font-size: 1.4rem; font-weight: 900; color: #fff; letter-spacing: -.5px; margin-bottom: 6px; position: relative; z-index: 1; }
.dpt .pcard-tagline { font-size: .82rem; color: rgba(255,255,255,.7); line-height: 1.5; position: relative; z-index: 1; }
.dpt .pcard-body { padding: 22px 28px; flex: 1; display: flex; flex-direction: column; }
.dpt .pcard-desc { font-size: .875rem; color: var(--text2); line-height: 1.7; margin-bottom: 20px; }
.dpt .pcard-features { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; flex: 1; }
.dpt .pcard-feature { display: flex; align-items: center; gap: 8px; font-size: .8rem; color: var(--text2); }
.dpt .pcard-feature-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.dpt .pcard-cta {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 20px; border-radius: var(--rs);
  font-size: .82rem; font-weight: 700;
  transition: background .15s, transform .12s, opacity .15s;
  border: none; align-self: flex-start;
}
.dpt .pcard-cta:hover { transform: translateY(-1px); opacity: .9; }
.dpt .pcard-cta svg { width: 13px; height: 13px; fill: none; stroke: currentColor; stroke-width: 2.5; transition: transform .2s; }
.dpt .pcard-cta:hover svg { transform: translateX(2px); }
.dpt .pcard-cta-ghost { color: var(--text3); background: var(--surface2); border: 1.5px solid var(--border) !important; cursor: default; border-radius: var(--rs); padding: 10px 20px; font-size: .82rem; font-weight: 600; display: inline-flex; align-items: center; gap: 8px; }

/* ── About ── */
.dpt .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: start; margin-top: 48px; }
@media (max-width: 820px) { .dpt .about-grid { grid-template-columns: 1fr; gap: 40px; } }
.dpt .about-bio { font-size: 14px; color: var(--text2); line-height: 1.85; }
.dpt .about-bio p + p { margin-top: 16px; }
.dpt .about-bio strong { color: var(--text); font-weight: 600; }
.dpt .founder-row { display: flex; align-items: center; gap: 14px; margin-top: 28px; padding-top: 20px; border-top: 1px solid var(--border); }
.dpt .founder-av { width: 42px; height: 42px; border-radius: 50%; background: var(--teal); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; flex-shrink: 0; }
.dpt .founder-name { font-size: 14px; font-weight: 700; color: var(--text); }
.dpt .founder-role { font-size: 12px; color: var(--text3); margin-top: 2px; }
.dpt .about-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); padding: 28px; box-shadow: var(--shadow); }
.dpt .about-card-lbl { font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: var(--text3); margin-bottom: 20px; }
.dpt .about-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
.dpt .about-stat { background: var(--surface2); border: 1px solid var(--border); border-radius: var(--rs); padding: 16px; }
.dpt .about-stat-num { font-size: 24px; font-weight: 800; letter-spacing: -.5px; color: var(--text); }
.dpt .about-stat-lbl { font-size: 11px; color: var(--text3); margin-top: 2px; }
.dpt .tech-tags { display: flex; gap: 6px; flex-wrap: wrap; }
.dpt .tech-tag { font-size: 11px; font-weight: 600; padding: 4px 12px; border-radius: 20px; background: var(--teal-light); color: var(--teal); border: 1px solid var(--teal-border); }

/* ── Services ── */
.dpt .svc-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-top: 40px; }
@media (max-width: 640px) { .dpt .svc-grid { grid-template-columns: 1fr; } }
.dpt .svc-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); padding: 28px; box-shadow: var(--shadow); transition: border-color .2s, box-shadow .2s; }
.dpt .svc-card:hover { border-color: var(--teal-border); box-shadow: var(--shadow-md); }
.dpt .svc-num { font-size: 10px; font-weight: 700; letter-spacing: 1px; color: var(--text3); margin-bottom: 16px; }
.dpt .svc-ico { width: 44px; height: 44px; border-radius: 10px; background: var(--teal-light); border: 1px solid var(--teal-border); display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
.dpt .svc-ico svg { width: 20px; height: 20px; fill: none; stroke: var(--teal); stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.dpt .svc-name { font-size: 16px; font-weight: 700; letter-spacing: -.3px; margin-bottom: 8px; color: var(--text); }
.dpt .svc-desc { font-size: 13px; color: var(--text2); line-height: 1.7; margin-bottom: 16px; }
.dpt .svc-items { display: flex; flex-direction: column; gap: 6px; }
.dpt .svc-item { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text3); }
.dpt .svc-item::before { content: ''; width: 5px; height: 5px; border-radius: 50%; background: var(--teal); flex-shrink: 0; opacity: .7; }

/* ── Process ── */
.dpt .steps-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; margin-top: 48px; position: relative; }
@media (max-width: 640px) { .dpt .steps-grid { grid-template-columns: 1fr 1fr; gap: 1px; background: var(--border); border-radius: var(--r); overflow: hidden; } }
.dpt .steps-grid::before { content: ''; position: absolute; top: 21px; left: calc(12.5% + 10px); right: calc(12.5% + 10px); height: 1px; background: var(--border); z-index: 0; }
@media (max-width: 640px) { .dpt .steps-grid::before { display: none; } }
.dpt .step { padding: 0 20px 0 0; position: relative; z-index: 1; }
@media (max-width: 640px) { .dpt .step { padding: 20px; background: var(--surface); } }
.dpt .step-num { width: 42px; height: 42px; border-radius: 50%; border: 1.5px solid var(--border); background: var(--surface); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; color: var(--text3); margin-bottom: 18px; }
.dpt .step-num.active { background: var(--teal); border-color: var(--teal); color: #fff; }
.dpt .step-title { font-size: 14px; font-weight: 700; letter-spacing: -.2px; margin-bottom: 6px; color: var(--text); }
.dpt .step-desc { font-size: 12px; color: var(--text2); line-height: 1.65; }

/* ── CTA ── */
.dpt .cta-section { background: linear-gradient(135deg, var(--teal) 0%, var(--teal-mid) 60%, #0a3a3f 100%); border-radius: var(--rx); padding: 72px 56px; text-align: center; position: relative; overflow: hidden; margin: 0 40px; }
@media (max-width: 640px) { .dpt .cta-section { margin: 0 20px; padding: 48px 28px; } }
.dpt .cta-section::before { content: ''; position: absolute; width: 360px; height: 360px; border-radius: 50%; background: rgba(255,255,255,.04); top: -100px; right: -80px; }
.dpt .cta-section::after { content: ''; position: absolute; width: 260px; height: 260px; border-radius: 50%; background: rgba(255,255,255,.03); bottom: -80px; left: -60px; }
.dpt .cta-section > * { position: relative; z-index: 1; }
.dpt .cta-h { font-size: clamp(28px, 4vw, 40px); font-weight: 800; letter-spacing: -1.2px; color: #fff; margin-bottom: 12px; }
.dpt .cta-p { font-size: 15px; color: rgba(255,255,255,.7); line-height: 1.7; max-width: 460px; margin: 0 auto 32px; }
.dpt .cta-actions { display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; }
.dpt .btn-cta { display: inline-flex; align-items: center; gap: 8px; padding: 12px 26px; background: #fff; color: var(--teal); border: none; border-radius: var(--rs); font-size: 14px; font-weight: 700; box-shadow: 0 4px 20px rgba(0,0,0,.15); transition: transform .15s, box-shadow .15s; }
.dpt .btn-cta:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,.2); }
.dpt .btn-cta svg { width: 14px; height: 14px; fill: none; stroke: var(--teal); stroke-width: 2.5; transition: transform .2s; }
.dpt .btn-cta:hover svg { transform: translateX(2px); }
.dpt .btn-cta-ghost { display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; background: rgba(255,255,255,.1); color: #fff; border: 1px solid rgba(255,255,255,.25); border-radius: var(--rs); font-size: 14px; font-weight: 600; transition: background .15s, transform .12s; }
.dpt .btn-cta-ghost:hover { background: rgba(255,255,255,.18); transform: translateY(-1px); }

/* ── Footer ── */
.dpt footer { border-top: 1px solid var(--border); padding: 28px 40px; margin-top: 80px; }
@media (max-width: 640px) { .dpt footer { padding: 24px 20px; margin-top: 56px; } }
.dpt .footer-inner { max-width: 1120px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
.dpt .footer-logo { display: flex; align-items: center; gap: 8px; }
.dpt .footer-logo-mark { width: 22px; height: 22px; background: var(--teal); border-radius: 6px; display: flex; align-items: center; justify-content: center; }
.dpt .footer-logo-mark svg { width: 11px; height: 11px; fill: none; stroke: #fff; stroke-width: 2.5; stroke-linecap: round; }
.dpt .footer-logo-name { font-size: 13px; font-weight: 700; color: var(--text2); }
.dpt .footer-links { display: flex; gap: 20px; }
.dpt .footer-links a { font-size: 12px; color: var(--text3); transition: color .15s; }
.dpt .footer-links a:hover { color: var(--text2); }
.dpt .footer-copy { font-size: 12px; color: var(--text3); }

/* ── Animations ── */
@keyframes dpt-fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
.dpt .fade-up { animation: dpt-fadeUp .5s ease both; }
.dpt .fade-1 { animation-delay: .05s; }
.dpt .fade-2 { animation-delay: .12s; }
.dpt .fade-3 { animation-delay: .2s; }
.dpt .fade-4 { animation-delay: .28s; }
`

const clientJs = `
(function(){
  // Mobile menu
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

  // Project data
  var PROJECTS = [
    {
      name: 'CuraLog',
      tagline: 'Medication & care coordination',
      desc: 'Full care management platform for caregivers, patients, and providers. Track medications, manage refill requests from prescriber to pharmacy, and keep everyone on the same page.',
      features: ['Multi-patient dashboard', 'Refill tracking — prescriber to pickup', 'Secure in-app messaging', '2FA secured portal'],
      status: 'live',
      color: '#0E4F54',
      url: '/curalog',
      icon: '<rect x="9" y="2" width="6" height="4" rx="1"/><path d="M8 6H6a2 2 0 00-2 2v11a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-2"/><path d="M12 12v4M10 14h4"/>',
    },
    {
      name: 'Finance Tracker',
      tagline: 'Your money, fully under control',
      desc: 'Personal finance dashboard to manage cards, subscriptions, and bills. Simulate debt payoff strategies, split shared expenses, send invoices, and track net worth over time.',
      features: ['Credit card & utilization tracking', 'Avalanche & snowball payoff planner', 'Shared expense invoicing', 'Progress snapshots'],
      status: 'live',
      color: '#4F6EF7',
      url: '/finance',
      icon: '<rect x="2" y="16" width="4" height="6" rx="1"/><rect x="9" y="11" width="4" height="11" rx="1"/><rect x="16" y="6" width="4" height="16" rx="1"/><polyline points="3,17 10,12 17,7 22,3"/><polyline points="19,2 22,3 21,6"/>',
    },
    {
      name: 'Client Portal',
      tagline: 'Project delivery & collaboration',
      desc: 'Private portal for DataPrimeTech clients. Milestone tracking, feedback threads, secure file handoff, and a single place to manage every deliverable.',
      features: ['Milestone & phase tracking', 'Threaded feedback & approvals', 'Secure document delivery', 'Client sign-off workflow'],
      status: 'building',
      color: '#6366F1',
      url: null,
      icon: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>',
    },
    {
      name: 'Field Ops Tracker',
      tagline: 'Job scheduling & crew management',
      desc: 'Purpose-built for small field-service businesses. Manage work orders, schedule crews, capture photo logs, collect client sign-offs, and generate invoices on the go.',
      features: ['Work order management', 'Crew scheduling & dispatch', 'Photo logs & client sign-off', 'Invoice generation'],
      status: 'building',
      color: '#F59E0B',
      url: null,
      icon: '<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>',
    },
  ];

  var grid = document.getElementById('dptPcardGrid');
  if (!grid) return;

  var liveCount = PROJECTS.filter(function(p){ return p.status === 'live'; }).length;
  var liveEl = document.getElementById('dptLiveCount');
  if (liveEl) liveEl.textContent = String(liveCount);

  grid.innerHTML = PROJECTS.map(function(p){
    var isLive = p.status === 'live';
    var badge = isLive
      ? '<span class="pcard-badge-live"><span class="pcard-badge-live-dot"></span>Live</span>'
      : '<span class="pcard-badge-building">Building</span>';
    var cta = isLive
      ? '<a href="' + p.url + '" target="_blank" rel="noopener" class="pcard-cta" style="background:' + p.color + ';color:#fff;">Open app<svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>'
      : '<span class="pcard-cta-ghost">Coming soon</span>';
    var features = p.features.map(function(f){
      return '<div class="pcard-feature"><span class="pcard-feature-dot" style="background:' + p.color + ';opacity:.7;"></span>' + f + '</div>';
    }).join('');

    return '<div class="pcard">'
      + '<div class="pcard-header" style="background:' + p.color + ';">'
      +   '<div class="pcard-header-top">'
      +     '<div class="pcard-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + p.icon + '</svg></div>'
      +     badge
      +   '</div>'
      +   '<div class="pcard-name">' + p.name + '</div>'
      +   '<div class="pcard-tagline">' + p.tagline + '</div>'
      + '</div>'
      + '<div class="pcard-body">'
      +   '<p class="pcard-desc">' + p.desc + '</p>'
      +   '<div class="pcard-features">' + features + '</div>'
      +   cta
      + '</div>'
      + '</div>';
  }).join('');
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
          <div className="nav-status"><span className="nav-status-dot" aria-hidden="true"></span>Available</div>
          <a href="#contact" className="nav-cta">Get in touch</a>
        </div>
        <button className="nav-hamburger" id="dptMenuBtn" aria-label="Toggle navigation" aria-expanded="false" aria-controls="dptMobileMenu">
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
          <div className="hero-badge fade-up">
            <span className="hero-badge-dot" aria-hidden="true"></span>
            Custom Web Development
          </div>
          <h1 className="hero-h1 fade-up fade-1">
            Software built<br/>for how you<br/><em>actually work.</em>
          </h1>
          <p className="hero-p fade-up fade-2">
            We design and build secure, fast web applications from scratch — no templates, no shortcuts.
            Every tool we ship is live, used daily, and built around a real problem worth solving.
          </p>
          <div className="hero-actions fade-up fade-3">
            <a href="#projects" className="btn-primary">
              Explore all apps
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
              <strong>4</strong>
              <span>Total projects</span>
            </div>
            <div className="hero-stat-div" aria-hidden="true"></div>
            <div className="hero-stat">
              <strong>100%</strong>
              <span>Custom built</span>
            </div>
            <div className="hero-stat-div" aria-hidden="true"></div>
            <div className="hero-stat">
              <strong>0</strong>
              <span>Templates used</span>
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
                { icon: 'M22 11.08V12a10 10 0 11-5.93-9.14 M22 4 12 14.01 9 11.01', title: 'Real workflows', desc: "Designed around actual day-to-day tasks. If it doesn't solve a real problem, we don't ship it." },
                { icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', title: 'Security first', desc: 'Authentication, role-based access, and private data handling built in from day one.' },
                { icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z', title: 'Fast iteration', desc: 'New features and fixes ship quickly. We maintain what we build, long-term.' },
              ].map(c => (
                <div key={c.title} className="proof-card">
                  <div className="proof-icon"><svg viewBox="0 0 24 24"><path d={c.icon}/></svg></div>
                  <div className="proof-title">{c.title}</div>
                  <p className="proof-desc">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <hr className="section-divider" />

        {/* ── Projects (equal grid) ── */}
        <section id="projects" aria-labelledby="projects-heading">
          <div className="wrap">
            <div className="section-label">Our work</div>
            <h2 id="projects-heading" className="section-h">Four projects.<br/>Each one built to solve a real problem.</h2>
            <p className="section-sub">Two live today, two on the way. Every app is purpose-built — different domain, different users, same standard.</p>
            <div className="pcard-grid" id="dptPcardGrid">
              {/* Filled by JS */}
              {[1,2,3,4].map(i => (
                <div key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, height: 380, opacity: .5, animation: 'dpt-shimmer 1.4s ease infinite' }} />
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
                    {['TypeScript','React','Next.js','PostgreSQL','Node.js','Supabase','Resend','Vercel'].map(t => (
                      <span key={t} className="tech-tag">{t}</span>
                    ))}
                  </div>
                </div>
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
                { num:'03', icon:'M22 12h-4l-3 9L9 3l-3 9H2', name:'Tracking & Automation', desc:'Apps that do the work for you. Auto-calculations, smart alerts, status tracking, and data that updates live.', items:['Auto-calculated fields and schedules','Email notifications','Real-time sync across all users'] },
                { num:'04', icon:'M12 2a10 10 0 100 20A10 10 0 0012 2zM2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20', name:'Websites & Pages', desc:'Clean, professional websites that load fast. No page builders — built from scratch with your brand in mind.', items:['Custom design, no templates','Deployed globally on enterprise-grade CDN','SEO optimized from day one'] },
              ].map(s => (
                <div key={s.num} className="svc-card">
                  <div className="svc-num">{s.num}</div>
                  <div className="svc-ico"><svg viewBox="0 0 24 24"><path d={s.icon}/></svg></div>
                  <div className="svc-name">{s.name}</div>
                  <div className="svc-desc">{s.desc}</div>
                  <ul className="svc-items">{s.items.map(i => <li key={i} className="svc-item">{i}</li>)}</ul>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 72 }}>
              <div className="section-label">The process</div>
              <h2 className="section-h" style={{ marginBottom: 0 }}>From idea to live<br/>in four steps.</h2>
            </div>
            <div className="steps-grid">
              {[
                { n:'01', active:true, title:'Discover', desc:'Tell us what you need. We ask the right questions to understand the problem before touching code.' },
                { n:'02', active:false, title:'Design', desc:"We map out the structure and flow. You see what it'll look like before anything is built." },
                { n:'03', active:false, title:'Build', desc:'Clean code from scratch. No templates, no bloat. Built exactly for your use case.' },
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
              <a href="#projects" className="btn-cta-ghost">View our work</a>
            </div>
          </div>
        </section>
      </main>

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
          </div>
          <span className="footer-copy">© 2026 DataPrimeTech</span>
        </div>
      </footer>

      <Script id="dpt-home" strategy="afterInteractive">{clientJs}</Script>
    </div>
  )
}
