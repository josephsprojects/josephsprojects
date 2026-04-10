import type { Metadata } from 'next'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'DataPrimeTech — Custom Web Applications',
  description: 'We design and build fast, secure, custom web applications. Real tools built around real workflows — not templates, not demos.',
  openGraph: {
    title: 'DataPrimeTech — Custom Web Applications',
    description: 'Fast, secure, custom software built around real workflows. Not demos — tools people actually use every day.',
    type: 'website',
    url: 'https://dataprimetech.com/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DataPrimeTech — Custom Web Applications',
    description: 'Fast, secure, custom software built around real workflows.',
  },
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');

.skip-link{position:absolute;left:-9999px;top:10px;background:var(--dpt-accent);color:#fff;padding:10px 16px;z-index:999;border-radius:8px;font-size:13px;font-weight:600;text-decoration:none}
.skip-link:focus{left:10px}

*:focus-visible{outline:2px solid var(--dpt-accent);outline-offset:3px;border-radius:4px}

:root{
  --dpt-font:'DM Sans',sans-serif;
  --dpt-font-display:'Syne',sans-serif;
  --dpt-accent:#6366F1;
  --dpt-accent-h:#4F46E5;
  --dpt-accent-light:rgba(99,102,241,.08);
  --dpt-accent-border:rgba(99,102,241,.18);
  --dpt-accent-glow:rgba(99,102,241,.28);
  --dpt-emerald:#10B981;
  --dpt-amber:#F59E0B;
  --dpt-r:16px;--dpt-rs:10px;--dpt-rx:24px;
  --dpt-bg:#F8F8FF;
  --dpt-surface:#FFFFFF;
  --dpt-surface2:#F3F3FD;
  --dpt-surface3:#EAEAF8;
  --dpt-border:rgba(0,0,0,.06);
  --dpt-border2:rgba(0,0,0,.11);
  --dpt-text:#1C1B2E;
  --dpt-text2:#52526A;
  --dpt-text3:#9B9BB5;
  --dpt-nav-bg:rgba(248,248,255,.88);
  --dpt-shadow:0 1px 2px rgba(0,0,0,.04),0 4px 16px rgba(0,0,0,.04);
  --dpt-shadow-lg:0 4px 24px rgba(0,0,0,.06),0 16px 64px rgba(0,0,0,.06);
}

@media(prefers-color-scheme:dark){:root{
  --dpt-bg:#0E0E18;--dpt-surface:#17172A;--dpt-surface2:#1E1E32;--dpt-surface3:#26263C;
  --dpt-border:rgba(255,255,255,.06);--dpt-border2:rgba(255,255,255,.1);
  --dpt-text:#EEEEFF;--dpt-text2:#9090B0;--dpt-text3:#55557A;
  --dpt-nav-bg:rgba(14,14,24,.88);
  --dpt-shadow:0 1px 2px rgba(0,0,0,.3),0 4px 16px rgba(0,0,0,.25);
  --dpt-shadow-lg:0 4px 24px rgba(0,0,0,.4),0 16px 64px rgba(0,0,0,.35);
}}

@media(prefers-reduced-motion:reduce){.dpt *{animation:none!important;transition:none!important;scroll-behavior:auto!important}}

.dpt{font-family:var(--dpt-font);background:var(--dpt-bg);color:var(--dpt-text);min-height:100vh;overflow-x:hidden;-webkit-font-smoothing:antialiased;scroll-behavior:smooth}
.dpt .display{font-family:var(--dpt-font-display)}

/* Nav */
.dpt nav{position:fixed;top:0;left:0;right:0;z-index:50;height:64px;padding:0 40px;display:flex;align-items:center;justify-content:space-between;background:var(--dpt-nav-bg);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border-bottom:1px solid var(--dpt-border)}
.dpt .logo{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--dpt-text)}
.dpt .logo-mark{width:30px;height:30px;border-radius:9px;background:var(--dpt-accent);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.dpt .logo-mark svg{width:16px;height:16px;fill:none;stroke:#fff;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}
.dpt .logo-name{font-family:var(--dpt-font-display);font-size:15px;font-weight:700;letter-spacing:-.3px}
.dpt .nav-links{display:flex;gap:2px}
.dpt .nav-links a{color:var(--dpt-text2);text-decoration:none;font-size:13px;font-weight:500;padding:7px 14px;border-radius:var(--dpt-rs);transition:background .15s,color .15s}
.dpt .nav-links a:hover,.dpt .nav-links a.active{background:var(--dpt-surface2);color:var(--dpt-text)}
.dpt .nav-right{display:flex;align-items:center;gap:10px}
.dpt .nav-pill{font-size:11px;font-weight:600;color:var(--dpt-accent);background:var(--dpt-accent-light);border:1px solid var(--dpt-accent-border);padding:5px 12px;border-radius:20px;display:flex;align-items:center;gap:6px}
.dpt .nav-dot{width:5px;height:5px;border-radius:50%;background:var(--dpt-accent);animation:dpt-pulse 2.5s infinite}
@keyframes dpt-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.85)}}
.dpt .btn-nav{padding:8px 18px;background:var(--dpt-accent);color:#fff;border:none;border-radius:var(--dpt-rs);font:600 13px var(--dpt-font);cursor:pointer;text-decoration:none;transition:background .15s,transform .1s;letter-spacing:-.1px}
.dpt .btn-nav:hover{background:var(--dpt-accent-h);transform:translateY(-1px)}
.dpt .mobile-menu-btn{display:none;background:none;border:none;font-size:20px;color:var(--dpt-text);cursor:pointer;padding:8px;border-radius:var(--dpt-rs);transition:background .15s;line-height:1}
.dpt .mobile-menu-btn:hover{background:var(--dpt-surface2)}
.dpt .mobile-menu{display:none;position:fixed;top:64px;left:0;right:0;z-index:49;background:var(--dpt-nav-bg);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border-bottom:1px solid var(--dpt-border);padding:12px 20px 20px;box-shadow:var(--dpt-shadow-lg)}
.dpt .mobile-menu.open{display:flex;flex-direction:column;gap:4px}
.dpt .mobile-menu a{text-decoration:none;color:var(--dpt-text);padding:12px 14px;font-size:15px;font-weight:600;border-radius:var(--dpt-rs);transition:background .15s}
.dpt .mobile-menu a:hover{background:var(--dpt-surface2)}
.dpt .mobile-menu-cta{margin-top:8px;padding:13px 18px!important;background:var(--dpt-accent)!important;color:#fff!important;border-radius:var(--dpt-rs);text-align:center}
@media(max-width:640px){.dpt nav{padding:0 20px}.dpt .nav-links,.dpt .nav-pill{display:none}.dpt .btn-nav{display:none}.dpt .mobile-menu-btn{display:block}}

/* Buttons */
.dpt .btn-primary{display:inline-flex;align-items:center;gap:8px;padding:14px 28px;background:var(--dpt-accent);color:#fff;border:none;border-radius:var(--dpt-r);font:600 14px var(--dpt-font);cursor:pointer;text-decoration:none;letter-spacing:-.1px;transition:background .15s,transform .12s,box-shadow .2s}
.dpt .btn-primary:hover{background:var(--dpt-accent-h);transform:translateY(-1px);box-shadow:0 6px 20px var(--dpt-accent-glow)}
.dpt .btn-primary svg{width:15px;height:15px;fill:none;stroke:#fff;stroke-width:2.5;transition:transform .2s}
.dpt .btn-primary:hover svg{transform:translateX(2px)}
.dpt .btn-ghost{display:inline-flex;align-items:center;gap:8px;padding:14px 28px;background:transparent;color:var(--dpt-text2);border:1px solid var(--dpt-border2);border-radius:var(--dpt-r);font:600 14px var(--dpt-font);cursor:pointer;text-decoration:none;letter-spacing:-.1px;transition:background .15s,color .15s,transform .12s}
.dpt .btn-ghost:hover{background:var(--dpt-surface2);color:var(--dpt-text);transform:translateY(-1px)}

/* Hero */
.dpt .hero{max-width:1120px;margin:0 auto;padding:140px 40px 100px;display:grid;grid-template-columns:1fr 400px;gap:80px;align-items:start}
@media(max-width:940px){.dpt .hero{grid-template-columns:1fr;gap:56px;padding:120px 24px 80px}}
.dpt .hero-tag{display:inline-flex;align-items:center;gap:8px;background:var(--dpt-surface2);border:1px solid var(--dpt-border2);color:var(--dpt-text2);font-size:11px;font-weight:600;letter-spacing:.8px;text-transform:uppercase;padding:6px 14px;border-radius:20px;margin-bottom:28px}
.dpt .hero-tag span{width:18px;height:18px;border-radius:50%;background:var(--dpt-accent);display:inline-flex;align-items:center;justify-content:center}
.dpt .hero-tag span svg{width:10px;height:10px;fill:none;stroke:#fff;stroke-width:2.5}
.dpt .hero-h1{font-family:var(--dpt-font-display);font-size:clamp(44px,6vw,72px);font-weight:800;line-height:1.02;letter-spacing:-2.5px;margin-bottom:22px}
.dpt .hero-h1 .accent{color:var(--dpt-accent)}
.dpt .hero-p{font-size:17px;font-weight:400;color:var(--dpt-text2);line-height:1.75;max-width:480px;margin-bottom:38px}
.dpt .hero-actions{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:52px}
.dpt .hero-proof{display:flex;align-items:center;gap:20px}
.dpt .hero-proof-stat{text-align:center}
.dpt .hero-proof-stat strong{display:block;font-family:var(--dpt-font-display);font-size:22px;font-weight:800;letter-spacing:-.5px;color:var(--dpt-text)}
.dpt .hero-proof-stat span{font-size:11px;color:var(--dpt-text3);font-weight:500}
.dpt .hero-proof-div{width:1px;height:30px;background:var(--dpt-border2)}
.dpt .hero-panel{background:var(--dpt-surface);border:1px solid var(--dpt-border);border-radius:20px;box-shadow:var(--dpt-shadow-lg);overflow:hidden;position:sticky;top:88px}
.dpt .hero-panel-header{padding:20px 24px;border-bottom:1px solid var(--dpt-border);display:flex;align-items:center;justify-content:space-between}
.dpt .hero-panel-title{font-size:12px;font-weight:600;color:var(--dpt-text2);letter-spacing:.3px}
.dpt .hero-panel-dots{display:flex;gap:5px}
.dpt .hero-panel-dot{width:8px;height:8px;border-radius:50%}
.dpt .hero-panel-apps{padding:16px;display:flex;flex-direction:column;gap:8px}
.dpt .app-row{display:flex;align-items:center;gap:14px;padding:14px 16px;background:var(--dpt-surface2);border:1px solid var(--dpt-border);border-radius:var(--dpt-rs);text-decoration:none;transition:border-color .15s,background .15s,transform .12s;cursor:pointer}
.dpt .app-row:hover{border-color:var(--dpt-accent-border);background:var(--dpt-accent-light);transform:translateX(2px)}
.dpt .app-row-icon{width:38px;height:38px;border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.dpt .app-row-icon svg{width:18px;height:18px;fill:none;stroke-width:1.8}
.dpt .app-row-info{flex:1}
.dpt .app-row-name{font-size:13px;font-weight:600;color:var(--dpt-text)}
.dpt .app-row-sub{font-size:11px;color:var(--dpt-text3);margin-top:1px}
.dpt .app-row-badge{font-size:10px;font-weight:700;letter-spacing:.3px;text-transform:uppercase;padding:3px 8px;border-radius:6px;flex-shrink:0}
.dpt .badge-live{background:rgba(16,185,129,.1);color:#059669;border:1px solid rgba(16,185,129,.22)}
.dpt .badge-soon{background:rgba(245,158,11,.1);color:var(--dpt-amber);border:1px solid rgba(245,158,11,.2)}
.dpt .badge-build{background:var(--dpt-accent-light);color:var(--dpt-accent);border:1px solid var(--dpt-accent-border)}
.dpt .hero-panel-footer{padding:14px 20px;border-top:1px solid var(--dpt-border);background:var(--dpt-surface2);font-size:11px;color:var(--dpt-text3);display:flex;align-items:center;gap:6px}
.dpt .hero-panel-footer svg{width:11px;height:11px;fill:none;stroke:var(--dpt-accent);stroke-width:2.5}

/* Layout */
.dpt .wrap{max-width:1120px;margin:0 auto;padding:0 40px}
@media(max-width:640px){.dpt .wrap{padding:0 24px}}
.dpt .divider{border:none;border-top:1px solid var(--dpt-border);margin:0 40px}
@media(max-width:640px){.dpt .divider{margin:0 24px}}
.dpt section{padding:96px 0}
@media(max-width:640px){.dpt section{padding:64px 0}}
.dpt .section-kicker{font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:var(--dpt-accent);margin-bottom:12px}
.dpt .section-h{font-family:var(--dpt-font-display);font-size:clamp(30px,3.5vw,44px);font-weight:800;letter-spacing:-1.5px;line-height:1.1;margin-bottom:14px}
.dpt .section-sub{font-size:15px;color:var(--dpt-text2);line-height:1.7;max-width:520px}

/* About */
.dpt .about-grid{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center;margin-top:56px}
@media(max-width:860px){.dpt .about-grid{grid-template-columns:1fr;gap:48px}}
.dpt .about-bio{font-size:15px;color:var(--dpt-text2);line-height:1.85}
.dpt .about-bio p+p{margin-top:18px}
.dpt .about-bio strong{color:var(--dpt-text);font-weight:600}
.dpt .about-card{background:var(--dpt-surface);border:1px solid var(--dpt-border);border-radius:var(--dpt-rx);padding:32px;box-shadow:var(--dpt-shadow-lg)}
.dpt .about-card-label{font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--dpt-text3);margin-bottom:18px}
.dpt .about-stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px}
.dpt .about-stat{background:var(--dpt-surface2);border-radius:var(--dpt-rs);padding:16px;border:1px solid var(--dpt-border)}
.dpt .about-stat-num{font-family:var(--dpt-font-display);font-size:24px;font-weight:800;letter-spacing:-.5px;color:var(--dpt-text)}
.dpt .about-stat-label{font-size:10px;color:var(--dpt-text3);margin-top:3px}
.dpt .about-tag-row{display:flex;gap:6px;flex-wrap:wrap}
.dpt .about-tag{font-size:11px;font-weight:600;padding:5px 12px;border-radius:20px;background:var(--dpt-accent-light);color:var(--dpt-accent);border:1px solid var(--dpt-accent-border)}
.dpt .founder-row{margin-top:24px;padding-top:20px;border-top:1px solid var(--dpt-border);display:flex;align-items:center;gap:14px}
.dpt .founder-av{width:44px;height:44px;border-radius:50%;flex-shrink:0;background:var(--dpt-accent);display:flex;align-items:center;justify-content:center;font-family:var(--dpt-font-display);font-size:15px;font-weight:800;color:#fff}
.dpt .founder-name{font-size:14px;font-weight:700;color:var(--dpt-text)}
.dpt .founder-title{font-size:12px;color:var(--dpt-text3);margin-top:1px}

/* Proof */
.dpt .proof-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2px;background:var(--dpt-border);border-radius:var(--dpt-rx);overflow:hidden;margin-top:48px}
@media(max-width:640px){.dpt .proof-grid{grid-template-columns:1fr}}
.dpt .proof-card{background:var(--dpt-surface);padding:32px 28px;position:relative;overflow:hidden}
.dpt .proof-card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,var(--dpt-accent-light) 0%,transparent 60%);opacity:0;transition:opacity .3s}
.dpt .proof-card:hover::before{opacity:1}
.dpt .proof-icon{width:44px;height:44px;border-radius:11px;border:1px solid var(--dpt-border2);display:flex;align-items:center;justify-content:center;margin-bottom:18px;position:relative;z-index:1;transition:border-color .2s,background .2s}
.dpt .proof-card:hover .proof-icon{border-color:var(--dpt-accent-border);background:var(--dpt-accent-light)}
.dpt .proof-icon svg{width:20px;height:20px;fill:none;stroke:var(--dpt-text2);stroke-width:1.8;transition:stroke .2s}
.dpt .proof-card:hover .proof-icon svg{stroke:var(--dpt-accent)}
.dpt .proof-title{font-family:var(--dpt-font-display);font-size:17px;font-weight:700;letter-spacing:-.4px;margin-bottom:8px;position:relative;z-index:1}
.dpt .proof-desc{font-size:13px;color:var(--dpt-text2);line-height:1.7;position:relative;z-index:1}

/* Projects */
.dpt .proj-grid{display:flex;flex-direction:column;gap:2px}
.dpt .proj{background:var(--dpt-surface);border:1px solid var(--dpt-border);border-radius:var(--dpt-r);padding:26px 28px;display:grid;grid-template-columns:52px 1fr auto;gap:20px;align-items:center;text-decoration:none;transition:border-color .18s,transform .18s,box-shadow .18s}
.dpt .proj:not(.proj-dim):hover{border-color:var(--dpt-accent-border);transform:translateX(3px);box-shadow:var(--dpt-shadow)}
.dpt .proj-dim{opacity:.55;cursor:default}
.dpt .proj-ico{width:52px;height:52px;border-radius:14px;border:1px solid var(--dpt-border2);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.dpt .proj-ico svg{width:22px;height:22px;fill:none;stroke-width:1.7}
.dpt .proj-name{font-family:var(--dpt-font-display);font-size:16px;font-weight:700;letter-spacing:-.3px;margin-bottom:5px}
.dpt .proj-desc{font-size:13px;color:var(--dpt-text2);line-height:1.55;margin-bottom:10px}
.dpt .proj-tags{display:flex;gap:5px;flex-wrap:wrap}
.dpt .proj-tag{font-size:10px;padding:2px 9px;border-radius:5px;background:var(--dpt-surface2);color:var(--dpt-text3);border:1px solid var(--dpt-border)}
.dpt .proj-right{display:flex;flex-direction:column;align-items:flex-end;gap:10px;flex-shrink:0}
.dpt .s-live{font-size:10px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;padding:4px 10px;border-radius:20px;background:rgba(16,185,129,.1);color:#059669;border:1px solid rgba(16,185,129,.22)}
.dpt .s-soon{font-size:10px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;padding:4px 10px;border-radius:20px;background:rgba(245,158,11,.1);color:var(--dpt-amber);border:1px solid rgba(245,158,11,.2)}
.dpt .s-build{font-size:10px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;padding:4px 10px;border-radius:20px;background:var(--dpt-accent-light);color:var(--dpt-accent);border:1px solid var(--dpt-accent-border)}
.dpt .proj-arr{width:32px;height:32px;border-radius:50%;border:1px solid var(--dpt-border2);display:flex;align-items:center;justify-content:center;transition:background .18s,border-color .18s}
.dpt .proj:not(.proj-dim):hover .proj-arr{background:var(--dpt-accent);border-color:var(--dpt-accent)}
.dpt .proj-arr svg{width:12px;height:12px;fill:none;stroke:var(--dpt-text3);stroke-width:2.5;transition:stroke .18s}
.dpt .proj:not(.proj-dim):hover .proj-arr svg{stroke:#fff}
@media(max-width:580px){.dpt .proj-right{display:none}}
.dpt .proj-skeleton{background:var(--dpt-surface);border:1px solid var(--dpt-border);border-radius:var(--dpt-r);padding:26px 28px;display:grid;grid-template-columns:52px 1fr;gap:20px;align-items:center}
.dpt .skel{background:var(--dpt-surface3);border-radius:6px;animation:dpt-shimmer 1.4s ease infinite}
@keyframes dpt-shimmer{0%,100%{opacity:.5}50%{opacity:1}}
.dpt .skel-icon{width:52px;height:52px;border-radius:14px}
.dpt .skel-line{height:12px;margin-bottom:8px}
.dpt .skel-short{width:40%}
.dpt .skel-med{width:65%}
.dpt .skel-long{width:85%}

/* Section label divider */
.dpt .section-label-divider{display:flex;align-items:center;gap:14px}
.dpt .section-label-divider span{font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--dpt-text3);white-space:nowrap}
.dpt .section-label-divider::before,.dpt .section-label-divider::after{content:'';flex:1;height:1px;background:var(--dpt-border)}

/* Spotlight */
.dpt .spotlight{background:var(--dpt-surface);border:1px solid var(--dpt-border);border-radius:var(--dpt-rx);overflow:hidden;margin-top:64px}
.dpt .spotlight-inner{display:grid;grid-template-columns:1fr 1fr}
@media(max-width:860px){.dpt .spotlight-inner{grid-template-columns:1fr}}
.dpt .spotlight-left{padding:56px 52px;border-right:1px solid var(--dpt-border)}
@media(max-width:860px){.dpt .spotlight-left{padding:40px 32px;border-right:none;border-bottom:1px solid var(--dpt-border)}}
.dpt .spotlight-label{display:inline-flex;align-items:center;gap:7px;background:rgba(16,185,129,.08);border:1px solid rgba(16,185,129,.2);color:#059669;font-size:11px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;padding:5px 12px;border-radius:20px;margin-bottom:24px}
.dpt .spotlight-label-dot{width:5px;height:5px;border-radius:50%;background:#059669;animation:dpt-pulse 2s infinite}
.dpt .spotlight-h{font-family:var(--dpt-font-display);font-size:clamp(26px,2.8vw,36px);font-weight:800;letter-spacing:-1.2px;line-height:1.1;margin-bottom:14px}
.dpt .spotlight-p{font-size:14px;color:var(--dpt-text2);line-height:1.75;margin-bottom:32px}
.dpt .spotlight-cta{display:inline-flex;align-items:center;gap:8px;padding:12px 22px;background:var(--dpt-accent);color:#fff;border:none;border-radius:var(--dpt-rs);font:600 13px var(--dpt-font);cursor:pointer;text-decoration:none;transition:background .15s,transform .12s}
.dpt .spotlight-cta:hover{background:var(--dpt-accent-h);transform:translateY(-1px)}
.dpt .spotlight-cta svg{width:14px;height:14px;fill:none;stroke:#fff;stroke-width:2.5;transition:transform .2s}
.dpt .spotlight-cta:hover svg{transform:translateX(2px)}
.dpt .spotlight-right{padding:40px 44px;display:flex;flex-direction:column;gap:14px;justify-content:center}
@media(max-width:860px){.dpt .spotlight-right{padding:32px}}
.dpt .feature-item{display:flex;align-items:flex-start;gap:16px;padding:16px 18px;background:var(--dpt-surface2);border:1px solid var(--dpt-border);border-radius:var(--dpt-r);transition:border-color .15s,background .15s}
.dpt .feature-item:hover{border-color:var(--dpt-accent-border);background:var(--dpt-accent-light)}
.dpt .feature-icon{width:36px;height:36px;border-radius:9px;background:var(--dpt-accent-light);border:1px solid var(--dpt-accent-border);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.dpt .feature-icon svg{width:16px;height:16px;fill:none;stroke:var(--dpt-accent);stroke-width:2}
.dpt .feature-text strong{display:block;font-size:13px;font-weight:600;color:var(--dpt-text);margin-bottom:2px}
.dpt .feature-text span{font-size:12px;color:var(--dpt-text2);line-height:1.5}

/* Services */
.dpt .services-head{margin-bottom:56px;display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:24px}
.dpt .services-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:2px;background:var(--dpt-border);border-radius:var(--dpt-rx);overflow:hidden}
@media(max-width:640px){.dpt .services-grid{grid-template-columns:1fr}}
.dpt .svc{background:var(--dpt-surface);padding:36px 32px;transition:background .2s;position:relative;overflow:hidden}
.dpt .svc::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,var(--dpt-accent-light) 0%,transparent 60%);opacity:0;transition:opacity .3s}
.dpt .svc:hover::before{opacity:1}
.dpt .svc-num{font-family:var(--dpt-font-display);font-size:11px;font-weight:700;letter-spacing:1px;color:var(--dpt-text3);margin-bottom:20px}
.dpt .svc-icon{width:48px;height:48px;border-radius:12px;border:1px solid var(--dpt-border2);display:flex;align-items:center;justify-content:center;margin-bottom:20px;position:relative;z-index:1;transition:border-color .2s,background .2s}
.dpt .svc:hover .svc-icon{border-color:var(--dpt-accent-border);background:var(--dpt-accent-light)}
.dpt .svc-icon svg{width:22px;height:22px;fill:none;stroke-width:1.8;transition:stroke .2s}
.dpt .svc:hover .svc-icon svg{stroke:var(--dpt-accent)!important}
.dpt .svc-name{font-family:var(--dpt-font-display);font-size:18px;font-weight:700;letter-spacing:-.4px;margin-bottom:10px;position:relative;z-index:1}
.dpt .svc-desc{font-size:13px;color:var(--dpt-text2);line-height:1.7;position:relative;z-index:1}
.dpt .svc-list{margin-top:16px;display:flex;flex-direction:column;gap:6px;position:relative;z-index:1}
.dpt .svc-list li{font-size:12px;color:var(--dpt-text3);list-style:none;display:flex;align-items:center;gap:7px}
.dpt .svc-list li::before{content:'';width:5px;height:5px;border-radius:50%;background:var(--dpt-accent);flex-shrink:0;opacity:.6}

/* Process */
.dpt .steps{display:grid;grid-template-columns:repeat(4,1fr);gap:0;margin-top:56px;position:relative}
@media(max-width:640px){.dpt .steps{grid-template-columns:1fr 1fr;gap:1px;background:var(--dpt-border)}}
.dpt .steps::before{content:'';position:absolute;top:22px;left:calc(12.5% + 12px);right:calc(12.5% + 12px);height:1px;background:linear-gradient(to right,var(--dpt-accent),var(--dpt-accent-light));opacity:.35;z-index:0}
@media(max-width:640px){.dpt .steps::before{display:none}}
.dpt .step{padding:0 24px 0 0;position:relative;z-index:1}
@media(max-width:640px){.dpt .step{padding:20px;background:var(--dpt-surface)}}
.dpt .step-circle{width:44px;height:44px;border-radius:50%;border:1.5px solid var(--dpt-border2);background:var(--dpt-surface);display:flex;align-items:center;justify-content:center;margin-bottom:20px;font-family:var(--dpt-font-display);font-size:13px;font-weight:800;color:var(--dpt-text3)}
.dpt .step-circle.active{background:var(--dpt-accent);border-color:var(--dpt-accent);color:#fff}
.dpt .step-title{font-weight:700;font-size:14px;margin-bottom:6px;letter-spacing:-.2px}
.dpt .step-desc{font-size:12px;color:var(--dpt-text2);line-height:1.65}

/* CTA */
.dpt .cta-wrap{background:linear-gradient(135deg,var(--dpt-accent-h) 0%,var(--dpt-accent) 50%,#818CF8 100%);border-radius:var(--dpt-rx);padding:72px 64px;text-align:center;position:relative;overflow:hidden;margin:0 40px}
@media(max-width:640px){.dpt .cta-wrap{margin:0 24px;padding:52px 32px}}
.dpt .cta-wrap::before{content:'';position:absolute;width:400px;height:400px;border-radius:50%;background:rgba(255,255,255,.06);top:-100px;right:-80px}
.dpt .cta-wrap::after{content:'';position:absolute;width:300px;height:300px;border-radius:50%;background:rgba(255,255,255,.04);bottom:-80px;left:-60px}
.dpt .cta-wrap>*{position:relative;z-index:1}
.dpt .cta-h{font-family:var(--dpt-font-display);font-size:clamp(28px,4vw,44px);font-weight:800;letter-spacing:-1.5px;color:#fff;margin-bottom:14px}
.dpt .cta-p{font-size:15px;color:rgba(255,255,255,.72);line-height:1.7;max-width:500px;margin:0 auto 36px}
.dpt .cta-actions{display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap}
.dpt .btn-cta{display:inline-flex;align-items:center;gap:8px;padding:14px 30px;background:#fff;color:var(--dpt-accent);border:none;border-radius:var(--dpt-r);font:700 14px var(--dpt-font);cursor:pointer;text-decoration:none;box-shadow:0 4px 24px rgba(0,0,0,.15);transition:transform .15s,box-shadow .15s}
.dpt .btn-cta:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(0,0,0,.2)}
.dpt .btn-cta svg{width:15px;height:15px;fill:none;stroke:var(--dpt-accent);stroke-width:2.5;transition:transform .2s}
.dpt .btn-cta:hover svg{transform:translateX(2px)}
.dpt .btn-cta-ghost{display:inline-flex;align-items:center;gap:8px;padding:14px 26px;background:rgba(255,255,255,.12);color:#fff;border:1px solid rgba(255,255,255,.25);border-radius:var(--dpt-r);font:600 14px var(--dpt-font);cursor:pointer;text-decoration:none;transition:background .15s,transform .12s}
.dpt .btn-cta-ghost:hover{background:rgba(255,255,255,.2);transform:translateY(-1px)}

/* Footer */
.dpt footer{border-top:1px solid var(--dpt-border);padding:32px 40px;margin-top:96px}
@media(max-width:640px){.dpt footer{padding:24px;margin-top:64px}}
.dpt .footer-inner{max-width:1120px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px}
.dpt .footer-logo{display:flex;align-items:center;gap:8px;text-decoration:none}
.dpt .footer-mark{width:22px;height:22px;background:var(--dpt-accent);border-radius:6px;display:flex;align-items:center;justify-content:center}
.dpt .footer-mark svg{width:11px;height:11px;fill:none;stroke:#fff;stroke-width:2.5}
.dpt .footer-name{font-family:var(--dpt-font-display);font-size:13px;font-weight:700;color:var(--dpt-text2)}
.dpt .footer-links{display:flex;gap:20px}
.dpt .footer-links a{font-size:12px;color:var(--dpt-text3);text-decoration:none;transition:color .15s}
.dpt .footer-links a:hover{color:var(--dpt-text2)}
.dpt .footer-copy{font-size:12px;color:var(--dpt-text3)}

/* Animations */
@keyframes dpt-fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
.dpt .fade-up{animation:dpt-fadeUp .5s ease both}
.dpt .fade-up-1{animation-delay:.05s}
.dpt .fade-up-2{animation-delay:.12s}
.dpt .fade-up-3{animation-delay:.2s}
.dpt .fade-up-4{animation-delay:.28s}
.dpt .fade-up-5{animation-delay:.36s}
`

const clientJs = `
(function(){
  // Mobile menu
  var btn = document.getElementById('dptMenuBtn');
  var menu = document.getElementById('dptMenu');
  if(btn && menu){
    btn.addEventListener('click',function(){
      var open = menu.classList.toggle('open');
      btn.setAttribute('aria-expanded',String(open));
      btn.innerHTML = open
        ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
        : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
    });
    menu.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click',function(){
        menu.classList.remove('open');
        btn.setAttribute('aria-expanded','false');
        btn.innerHTML='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
      });
    });
  }

  // Projects
  var ICONS={
    clipboard:'<rect x="9" y="2" width="6" height="4" rx="1"/><path d="M8 6H6a2 2 0 00-2 2v11a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-2"/><path d="M12 12v4M10 14h4"/>',
    dollar:'<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>',
    briefcase:'<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>',
    map:'<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>',
    code:'<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
  };
  var BADGE={live:'<span class="s-live">Live</span>',soon:'<span class="s-soon">Coming soon</span>',building:'<span class="s-build">Building</span>'};
  var FALLBACK=[
    {name:'CuraLog',description:'Full medication management platform for caregivers and care teams. Multi-patient support, refill tracking, provider lookup, and role-based access.',tags:['Healthcare','Supabase','2FA','Prisma'],status:'live',icon:'clipboard',color:'#4F6EF7',url:'/medicationtracker'},
    {name:'Finance Tracker',description:'Personal finance dashboard for tracking credit cards, subscriptions, and bills. Debt payoff calculator and utilization alerts.',tags:['Finance','Supabase','2FA','Dashboard'],status:'live',icon:'dollar',color:'#10B981',url:'/finance'},
    {name:'Client Portal',description:'Private project delivery and file-sharing portal for DataPrimeTech clients. Milestone tracking, feedback threads, and secure document handoff.',tags:['Workflow','Collaboration','Security'],status:'building',icon:'briefcase',color:'#6366F1',url:null},
    {name:'Field Ops Tracker',description:'Job scheduling and crew management tool for small field-service businesses. Work orders, photo logs, and invoice generation.',tags:['Operations','Scheduling','Mobile'],status:'building',icon:'map',color:'#F59E0B',url:null}
  ];

  function renderProjects(projects,targetId,statuses){
    var filtered=projects.filter(function(p){return statuses.includes(p.status)});
    var el=document.getElementById(targetId);
    if(!el||!filtered.length){if(el)el.innerHTML='';return;}
    el.innerHTML=filtered.map(function(p){
      var isLive=p.status==='live';
      var icon=ICONS[p.icon]||ICONS.code;
      var bg=p.color+'18';var br=p.color+'30';
      return '<'+(isLive?'a href="'+p.url+'" target="_blank" rel="noopener"':'div')+' class="proj'+(isLive?'':' proj-dim')+'">'
        +'<div class="proj-ico" style="background:'+bg+';border-color:'+br+'">'
        +'<svg viewBox="0 0 24 24" fill="none" stroke="'+p.color+'" stroke-width="1.7">'+icon+'</svg></div>'
        +'<div><div class="proj-name display">'+p.name+'</div>'
        +'<div class="proj-desc">'+p.description+'</div>'
        +'<div class="proj-tags">'+p.tags.map(function(t){return'<span class="proj-tag">'+t+'</span>'}).join('')+'</div></div>'
        +'<div class="proj-right">'+(BADGE[p.status]||BADGE.soon)+(isLive?'<div class="proj-arr"><svg viewBox="0 0 24 24" fill="none" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>':'')+'</div>'
        +'</'+(isLive?'a':'div')+'>';
    }).join('');
    var liveEl=document.getElementById('dptLiveCount');
    if(liveEl)liveEl.textContent=String(projects.filter(function(p){return p.status==='live'}).length);
  }

  fetch('/projects.json',{cache:'no-store'})
    .then(function(r){return r.ok?r.json():Promise.reject()})
    .then(function(data){
      renderProjects(data,'dptLiveList',['live']);
      renderProjects(data,'dptWipList',['building','soon']);
    })
    .catch(function(){
      renderProjects(FALLBACK,'dptLiveList',['live']);
      renderProjects(FALLBACK,'dptWipList',['building','soon']);
    });
})();
`

export default function DataPrimeTechHome() {
  return (
    <div className="dpt">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* Nav */}
      <nav>
        <a href="/" className="logo" aria-label="DataPrimeTech home">
          <div className="logo-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
          </div>
          <span className="logo-name display">DataPrimeTech</span>
        </a>
        <div className="nav-links" role="navigation" aria-label="Primary">
          <a href="/" className="active">Home</a>
          <a href="#projects">Projects</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </div>
        <div className="nav-right">
          <div className="nav-pill" aria-label="Currently available for new projects">
            <span className="nav-dot" aria-hidden="true"></span>
            Available for projects
          </div>
          <a href="#contact" className="btn-nav">Get in touch</a>
        </div>
        <button className="mobile-menu-btn" id="dptMenuBtn" aria-label="Open navigation menu" aria-expanded="false" aria-controls="dptMenu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </nav>

      {/* Mobile menu */}
      <div className="mobile-menu" id="dptMenu" role="navigation" aria-label="Mobile navigation">
        <a href="/">Home</a>
        <a href="#projects">Projects</a>
        <a href="#about">About</a>
        <a href="#contact" className="mobile-menu-cta">Get in touch →</a>
      </div>

      {/* Hero */}
      <main id="main-content">
        <div className="hero">
          <div className="hero-left">
            <div className="hero-tag fade-up">
              <span aria-hidden="true"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></span>
              Custom Web Development
            </div>
            <h1 className="hero-h1 fade-up fade-up-1 display">
              Software built<br/>
              for how you<br/>
              <span className="accent">actually work.</span>
            </h1>
            <p className="hero-p fade-up fade-up-2">
              We design and build secure, fast web applications from scratch — no templates, no shortcuts. If you have a problem worth solving, we&apos;ll build the tool to solve it.
            </p>
            <div className="hero-actions fade-up fade-up-3">
              <a href="/medicationtracker" className="btn-primary">
                See CuraLog live
                <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
              <a href="#contact" className="btn-ghost">Start a project</a>
            </div>
            <div className="hero-proof fade-up fade-up-4">
              <div className="hero-proof-stat">
                <strong id="dptLiveCount">2</strong>
                <span>Live apps</span>
              </div>
              <div className="hero-proof-div" aria-hidden="true"></div>
              <div className="hero-proof-stat">
                <strong>100%</strong>
                <span>Custom built</span>
              </div>
              <div className="hero-proof-div" aria-hidden="true"></div>
              <div className="hero-proof-stat">
                <strong>2FA</strong>
                <span>Secured</span>
              </div>
            </div>
          </div>

          <div className="hero-right fade-up fade-up-5">
            <div className="hero-panel">
              <div className="hero-panel-header">
                <span className="hero-panel-title">All products</span>
                <div className="hero-panel-dots" aria-hidden="true">
                  <div className="hero-panel-dot" style={{ background: '#F87171' }}></div>
                  <div className="hero-panel-dot" style={{ background: '#FBBF24' }}></div>
                  <div className="hero-panel-dot" style={{ background: '#34D399' }}></div>
                </div>
              </div>
              <div className="hero-panel-apps">
                <a href="/medicationtracker" className="app-row">
                  <div className="app-row-icon" style={{ background: 'rgba(79,110,247,.1)', border: '1px solid rgba(79,110,247,.2)' }} aria-hidden="true">
                    <svg viewBox="0 0 24 24" stroke="#4F6EF7"><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M8 6H6a2 2 0 00-2 2v11a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-2"/><path d="M12 12v4M10 14h4"/></svg>
                  </div>
                  <div className="app-row-info">
                    <div className="app-row-name">CuraLog</div>
                    <div className="app-row-sub">Medication &amp; care management</div>
                  </div>
                  <span className="app-row-badge badge-live">Live</span>
                </a>
                <a href="/finance" className="app-row">
                  <div className="app-row-icon" style={{ background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.2)' }} aria-hidden="true">
                    <svg viewBox="0 0 24 24" stroke="#10B981"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                  </div>
                  <div className="app-row-info">
                    <div className="app-row-name">Finance Tracker</div>
                    <div className="app-row-sub">Cards · Subscriptions · Debt payoff</div>
                  </div>
                  <span className="app-row-badge badge-live">Live</span>
                </a>
                <div className="app-row" style={{ cursor: 'default' }} aria-hidden="true">
                  <div className="app-row-icon" style={{ background: 'rgba(99,102,241,.08)', border: '1px solid rgba(99,102,241,.15)' }}>
                    <svg viewBox="0 0 24 24" stroke="#6366F1"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
                  </div>
                  <div className="app-row-info">
                    <div className="app-row-name">Client Portal</div>
                    <div className="app-row-sub">Project delivery &amp; file handoff</div>
                  </div>
                  <span className="app-row-badge badge-build">Building</span>
                </div>
                <div className="app-row" style={{ cursor: 'default' }} aria-hidden="true">
                  <div className="app-row-icon" style={{ background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.2)' }}>
                    <svg viewBox="0 0 24 24" stroke="#F59E0B"><circle cx="12" cy="12" r="3"/><path d="M3 12h3M18 12h3M12 3v3M12 18v3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>
                  </div>
                  <div className="app-row-info">
                    <div className="app-row-name">Field Ops Tracker</div>
                    <div className="app-row-sub">Job scheduling &amp; crew management</div>
                  </div>
                  <span className="app-row-badge badge-soon">Soon</span>
                </div>
              </div>
              <div className="hero-panel-footer">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                2FA secured · Cloud synced · Cross-device
              </div>
            </div>
          </div>
        </div>

        <hr className="divider" />

        {/* Why us */}
        <section aria-labelledby="proof-heading">
          <div className="wrap">
            <div className="section-kicker">Why DataPrimeTech</div>
            <h2 id="proof-heading" className="section-h display">Practical software,<br/>not demos.</h2>
            <p className="section-sub">Every app we ship is live, used daily, and built around a real workflow — not a portfolio piece.</p>
            <div className="proof-grid">
              <div className="proof-card">
                <div className="proof-icon"><svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
                <div className="proof-title">Real workflows</div>
                <p className="proof-desc">Apps designed around actual day-to-day tasks, not generic templates. If it doesn&apos;t solve a real problem, we don&apos;t ship it.</p>
              </div>
              <div className="proof-card">
                <div className="proof-icon"><svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
                <div className="proof-title">Security first</div>
                <p className="proof-desc">Authentication, roles, and private data handling built in from the start — not added as an afterthought.</p>
              </div>
              <div className="proof-card">
                <div className="proof-icon"><svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>
                <div className="proof-title">Fast iteration</div>
                <p className="proof-desc">New features and refinements ship quickly without rebuilding everything. We maintain what we build.</p>
              </div>
            </div>
          </div>
        </section>

        <hr className="divider" />

        {/* About */}
        <section id="about" aria-labelledby="about-heading">
          <div className="wrap">
            <div className="section-kicker">About</div>
            <h2 id="about-heading" className="section-h display">Who we are.</h2>
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
                    <div className="founder-title">Founder &amp; Developer · DataPrimeTech</div>
                  </div>
                </div>
              </div>
              <div>
                <div className="about-card">
                  <div className="about-card-label">By the numbers</div>
                  <div className="about-stat-grid">
                    <div className="about-stat"><div className="about-stat-num">2</div><div className="about-stat-label">Live apps</div></div>
                    <div className="about-stat"><div className="about-stat-num">2</div><div className="about-stat-label">In progress</div></div>
                    <div className="about-stat"><div className="about-stat-num">100%</div><div className="about-stat-label">Custom built</div></div>
                    <div className="about-stat"><div className="about-stat-num">0</div><div className="about-stat-label">Templates used</div></div>
                  </div>
                  <div className="about-tag-row">
                    {['Next.js','Supabase','Prisma','TypeScript','Vercel','Postgres'].map(t => (
                      <span key={t} className="about-tag">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <hr className="divider" />

        {/* CuraLog spotlight */}
        <section aria-labelledby="spotlight-heading">
          <div className="wrap">
            <div className="section-kicker">Featured project</div>
            <h2 id="spotlight-heading" className="section-h display">CuraLog — medication<br/>management that works.</h2>
            <p className="section-sub">Our most comprehensive app. Built for caregivers, patients, and providers who need more than a reminder app.</p>
            <div className="spotlight">
              <div className="spotlight-inner">
                <div className="spotlight-left">
                  <div className="spotlight-label">
                    <span className="spotlight-label-dot" aria-hidden="true"></span>
                    Live now
                  </div>
                  <h3 className="spotlight-h display">Multi-patient care,<br/>built for real teams.</h3>
                  <p className="spotlight-p">CuraLog is a full medication management platform with caregiver portals, refill tracking, provider lookup, and secure messaging — all in one place.</p>
                  <a href="/medicationtracker" className="spotlight-cta">
                    Open CuraLog
                    <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </a>
                </div>
                <div className="spotlight-right">
                  {[
                    { icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M12 7a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75', title: 'Multi-patient support', desc: 'Manage medications across multiple patients from one dashboard' },
                    { icon: 'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0', title: 'Refill alerts', desc: 'Smart reminders before medications run out, with request workflows' },
                    { icon: 'M3 11h18v11H3z M7 11V7a5 5 0 0110 0v4', title: 'Role-based access', desc: 'Owners, helpers, patients, and providers each see exactly what they need' },
                    { icon: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z', title: 'Secure messaging', desc: 'In-app messaging between caregivers, patients, and care team members' },
                    { icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', title: '2FA secured portal', desc: 'TOTP authentication, encrypted storage, and full audit logging' },
                  ].map(f => (
                    <div key={f.title} className="feature-item">
                      <div className="feature-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d={f.icon} />
                        </svg>
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

        <hr className="divider" />

        {/* Projects */}
        <section id="projects" aria-labelledby="projects-heading">
          <div className="wrap">
            <div className="section-kicker">Projects</div>
            <h2 id="projects-heading" className="section-h display">What we&apos;ve built<br/>and what&apos;s next.</h2>
            <p className="section-sub" style={{ marginBottom: 0 }}>Real apps solving real problems — used every day, and more on the way.</p>
            <div className="section-label-divider" style={{ marginTop: 40 }}>
              <span>Live now</span>
            </div>
            <div className="proj-grid" id="dptLiveList" aria-live="polite" style={{ marginTop: 16 }}>
              <div className="proj-skeleton"><div className="skel skel-icon"></div><div><div className="skel skel-line skel-med" style={{ marginBottom: 10 }}></div><div className="skel skel-line skel-long"></div></div></div>
            </div>
            <div className="section-label-divider" style={{ marginTop: 36 }}>
              <span>Currently building</span>
            </div>
            <div className="proj-grid" id="dptWipList" aria-live="polite" style={{ marginTop: 16 }}>
              <div className="proj-skeleton"><div className="skel skel-icon"></div><div><div className="skel skel-line skel-short" style={{ marginBottom: 10 }}></div><div className="skel skel-line skel-med"></div></div></div>
            </div>
          </div>
        </section>

        <hr className="divider" />

        {/* Services */}
        <section aria-labelledby="services-heading">
          <div className="wrap">
            <div className="services-head">
              <div>
                <div className="section-kicker">What we do</div>
                <h2 id="services-heading" className="section-h display">Built for your<br/>exact use case.</h2>
              </div>
              <p className="section-sub">Every app is designed from scratch around what you actually need — not adapted from something generic.</p>
            </div>
            <div className="services-grid">
              {[
                { num:'01', icon:'M2 3h20v14H2z M8 21h8M12 17v4', name:'Web Applications', desc:'Full custom apps built from the ground up. Fast, secure, and designed to work on every device.', items:['Password-protected with two-factor auth','Cloud database — syncs in real time','Works on any screen size'] },
                { num:'02', icon:'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', name:'Secure Private Tools', desc:'For sensitive data. Built with real security layers — TOTP auth, encrypted storage, session management.', items:['TOTP two-factor authentication','Works with 1Password, Authy, Google Auth','Role-based access for teams'] },
                { num:'03', icon:'M22 12h-4l-3 9L9 3l-3 9H2', name:'Tracking & Automation', desc:'Apps that do the work for you. Auto-calculations, smart alerts, status tracking, and data that updates daily.', items:['Auto-calculated fields and schedules','Text and email notifications','Real-time sync across all users'] },
                { num:'04', icon:'M12 12m-10 0a10 10 0 1020 0 10 10 0 00-20 0 M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20', name:'Websites & Pages', desc:'Clean, professional websites that load fast. No templates — built from scratch with your brand in mind.', items:['Custom design, no page builders','Dark mode and light mode support','Deployed globally on Vercel CDN'] },
              ].map(s => (
                <div key={s.num} className="svc">
                  <div className="svc-num">{s.num}</div>
                  <div className="svc-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d={s.icon} />
                    </svg>
                  </div>
                  <div className="svc-name display">{s.name}</div>
                  <div className="svc-desc">{s.desc}</div>
                  <ul className="svc-list">{s.items.map(i => <li key={i}>{i}</li>)}</ul>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 80 }}>
              <div className="section-kicker">The process</div>
              <h2 className="section-h display" style={{ marginBottom: 0 }}>From idea to live<br/>in four steps.</h2>
            </div>
            <div className="steps" role="list">
              {[
                { n:'01', active:true, title:'Discover', desc:'Tell us what you need. We ask the right questions to understand the problem before touching code.' },
                { n:'02', active:false, title:'Design', desc:"We map out the structure and flow. You see what it'll look like before anything is built." },
                { n:'03', active:false, title:'Build', desc:"Clean code from scratch. No templates, no bloat. Built exactly for your use case and nobody else's." },
                { n:'04', active:false, title:'Launch & Support', desc:'Live on your domain in minutes. Updates deploy in under 30 seconds whenever you need a change.' },
              ].map(s => (
                <div key={s.n} className="step" role="listitem">
                  <div className={`step-circle${s.active ? ' active' : ''}`}>{s.n}</div>
                  <div className="step-title">{s.title}</div>
                  <div className="step-desc">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="contact" style={{ paddingTop: 0 }} aria-labelledby="cta-heading">
          <div className="cta-wrap">
            <h2 id="cta-heading" className="cta-h display">Have an idea?<br/>Let&apos;s build it.</h2>
            <p className="cta-p">Whether it&apos;s a tool for your team, a personal project, or something you&apos;ve never seen built before — if you can describe it, we can build it.</p>
            <div className="cta-actions">
              <a href="mailto:joseph@dataprimetech.com" className="btn-cta">
                Book a project call
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
              <a href="/medicationtracker" className="btn-cta-ghost">See CuraLog live →</a>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-inner">
          <a href="/" className="footer-logo" aria-label="DataPrimeTech home">
            <div className="footer-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            </div>
            <span className="footer-name display">DataPrimeTech</span>
          </a>
          <nav className="footer-links" aria-label="Footer navigation">
            <a href="/">Home</a>
            <a href="#projects">Projects</a>
            <a href="#about">About</a>
            <a href="/medicationtracker">CuraLog</a>
            <a href="/finance">Finance</a>
            <a href="mailto:joseph@dataprimetech.com">Contact</a>
          </nav>
          <div className="footer-copy">© 2026 dataprimetech.com</div>
        </div>
      </footer>

      <Script id="dpt-home" strategy="afterInteractive">{clientJs}</Script>
    </div>
  )
}
