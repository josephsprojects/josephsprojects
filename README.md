# CuraLog

**The care coordination platform for families, caregivers, and healthcare teams.**

Built by **Joseph Diaz-Ordonez** · [DataPrimeTech](https://dataprimetech.com)

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Hosting | Vercel |
| Database | PostgreSQL via Supabase |
| ORM | Prisma |
| Auth | Supabase Auth |
| Medication Search | RxNorm (NIH) |
| Provider Search | NPPES NPI Registry |
| Email | Resend |
| SMS | Twilio |
| Storage | Supabase Storage |
| Monitoring | Sentry |

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/josephsprojects/DataPrimeTech
cd curalog-app
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in your values in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL` — from Supabase project settings
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — from Supabase project settings  
- `SUPABASE_SERVICE_ROLE_KEY` — from Supabase project settings (**keep secret, server only**)
- `DATABASE_URL` — Supabase Postgres connection string (with pgbouncer)
- `DIRECT_URL` — Supabase Postgres direct connection string
- `RESEND_API_KEY` — from resend.com
- `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_PHONE_NUMBER` — from twilio.com

### 3. Set up the database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to Supabase
npm run db:push

# Seed: creates owner user + feature flags
npm run db:seed
```

The seed creates **one** platform owner:
- **Name:** Joseph Diaz-Ordonez  
- **Email:** joseph@dataprimetech.com
- **Role:** platform_owner

After seeding, visit `/login` → click "Forgot password?" → enter `joseph@dataprimetech.com` → check email to set your password.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Deploy to Vercel

```bash
# Link to Vercel project
npx vercel link

# Add environment variables
npx vercel env pull

# Deploy
npx vercel --prod
```

---

## Routes

| Route | Description | Auth |
|---|---|---|
| `/` | Public homepage | Public |
| `/login` | Universal login (all roles) | Public |
| `/forgot-password` | Password reset request | Public |
| `/reset-password` | Set new password (from email link) | Public |
| `/owner` | Owner dashboard | `platform_owner` only |
| `/owner/workspaces` | Workspace management | `platform_owner` only |
| `/owner/patients` | Patient management | `platform_owner` only |
| `/owner/medications` | Medication management | `platform_owner` only |
| `/owner/requests` | Refill request pipeline | `platform_owner` only |
| `/owner/notifications` | Platform notifications | `platform_owner` only |
| `/owner/messages` | In-app messages | `platform_owner` only |
| `/owner/audit` | Audit log | `platform_owner` only |
| `/owner/admin` | Feature flags + integrations | `platform_owner` only |
| `/owner/settings` | Account + security settings | `platform_owner` only |

---

## API Routes

All API routes are **server-side Route Handlers** — no client-side calls to external APIs.

```
GET  /api/medications/search?q=    RxNorm medication autocomplete
GET  /api/providers/search?last_name=&state=    NPI Registry provider search
GET  /api/pharmacies/search?name=&zip=    NPPES pharmacy search

GET  /api/workspaces    List workspaces
POST /api/workspaces    Create workspace
PATCH /api/workspaces?id=    Update workspace

GET  /api/patients    List patients
POST /api/patients    Create patient
PATCH /api/patients?id=    Update patient

GET  /api/medications    List medications
POST /api/medications    Create medication

GET  /api/refill-requests    List refill requests
POST /api/refill-requests    Create refill request
PATCH /api/refill-requests?id=    Update refill status

GET  /api/audit    Audit log (owner only)
POST /api/audit/log    Log an action

PATCH /api/admin/flags    Toggle feature flag
GET  /api/admin/health-check?url=    Check integration health

PATCH /api/settings/profile    Update profile
```

---

## Architecture decisions

### Server-side auth only
All authentication and authorization is enforced in `middleware.ts` and server components using `requireAuth()` / `requireOwner()`. No permissions are checked only in the UI.

### One platform owner
There is exactly one `platform_owner` in production: `joseph@dataprimetech.com`. The seed creates this user once. No UI flow can create another owner. Role escalation to `platform_owner` is only possible via direct database access.

### Blank-first design
The owner dashboard starts completely empty. No fake workspaces, patients, or medications are seeded. Joseph sees an onboarding checklist: Create workspace → Add patient → Add medication.

### All APIs are server-side
Browser-accessible pages call `/api/*` route handlers. Those route handlers call RxNorm, NPPES, and other external APIs **server-side**. The browser never calls external APIs directly.

---

## Security

- All routes protected by `middleware.ts` — unauthenticated users are redirected to `/login`
- Owner routes verify `role === 'platform_owner'` AND `email === OWNER_EMAIL` at the middleware level
- Passwords are managed entirely by Supabase Auth — not stored or hashed manually
- Every significant action creates an audit log entry
- Service role key is server-only — never exposed to the browser
- HTTPS enforced by Vercel

---

## Built by

**Joseph Diaz-Ordonez**  
Owner, DataPrimeTech  
[josephdiazordonez.com](https://josephdiazordonez.com) · [joseph@dataprimetech.com](mailto:joseph@dataprimetech.com)

© 2026 DataPrimeTech. All rights reserved.
