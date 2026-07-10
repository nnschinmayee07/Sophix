# Sophix

Event participation platform for hackathons, conferences, competitions, and workshops.

## Stack

- **Framework:** Next.js 13 (pages router), React 18, TypeScript
- **Database:** Neon Postgres (serverless driver, `@neondatabase/serverless`)
- **Auth:** NextAuth.js (credentials provider, JWT sessions) — admin and participant accounts
- **Payments:** Razorpay Payment Links + webhooks (INR only)
- **UI:** Framer Motion, Recharts, plain CSS (`styles/globals.css`)

## Setup

```bash
npm install
```

Copy `.env.example` to `.env.local` and fill in the values (see below). Then apply the schema in
`supabase/schema.sql` to your Neon database (safe to run repeatedly — it's idempotent and migrates
the legacy schema if present).

```bash
npm run dev
```

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | Neon Postgres connection string |
| `NEXTAUTH_SECRET` | Yes | Session signing secret (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Yes | Base URL of the app (`http://localhost:3000` in dev) |
| `RAZORPAY_KEY_ID` | For paid events | Razorpay key ID (test mode: `dashboard.razorpay.com` → Settings → API Keys). Leave blank to disable paid checkout gracefully. |
| `RAZORPAY_KEY_SECRET` | For paid events | Razorpay key secret, paired with the key ID above |
| `RAZORPAY_WEBHOOK_SECRET` | For paid events | Signing secret for the `/api/webhooks/razorpay` endpoint (set when creating the webhook in the Razorpay dashboard) |
| `NEXT_PUBLIC_APP_URL` | Yes | Public app URL, used for Razorpay redirect URLs |

## Roles

- **Public visitor** — landing page, features, community, browse published events.
- **Participant** — signs up / logs in at `/login`, enrolls in free events instantly, paid events go
  through a Razorpay payment link, and can view their enrollments at `/my/enrollments`.
- **Admin** — logs in at `/dashboard` with a real account (seeded admin: `admin@sophix.dev` /
  `ChangeMe123!` — change this password immediately in production). Can create/edit/publish/delete
  events and view enrollments + analytics.

## Admin API routes

All `/api/events/admin/*` and `/api/admin/*` routes require an authenticated admin session
(enforced server-side via `getServerSession`, not just client-side hiding). The dashboard login form
also verifies the account's role client-side before granting access, and signs the session back out
if a non-admin account authenticates successfully.

- `GET /api/events` — published events (public)
- `GET /api/events/[slug]` — single published event (public)
- `GET/POST /api/events/admin` — list all events / create (admin)
- `PATCH/DELETE /api/events/admin/[id]` — update / delete (admin)
- `POST /api/auth/signup` — create a participant account
- `GET /api/my/enrollments` — the logged-in participant's own enrollments (requires session)
- `POST /api/enrollments` — enroll in an event (free → confirmed instantly, paid → pending + Razorpay redirect)
- `POST /api/checkout/create-session` — create a Razorpay payment link for a pending enrollment
- `POST /api/webhooks/razorpay` — Razorpay webhook (verifies signature, confirms enrollment on `payment_link.paid`)
- `GET /api/admin/stats` — dashboard analytics (admin)

## Manual test checklist

- [ ] `/participants` lists published events (not 0)
- [ ] Enrolling in a free event confirms instantly and blocks duplicate enrollment by email
- [ ] Enrolling in a full event (capacity reached) is rejected with a clear message
- [ ] Enrolling in a paid event without Razorpay keys configured shows "Payments are not configured yet"
- [ ] With Razorpay test keys set, paid enrollment redirects to a Razorpay payment link, and completing
      payment redirects to `/checkout/success` and confirms the enrollment via webhook
- [ ] Cancelling checkout redirects to `/checkout/cancel` without confirming enrollment
- [ ] Participant signup at `/login` creates an account; wrong password on login is rejected
- [ ] `/dashboard` rejects wrong credentials with a real error, and rejects participant accounts
- [ ] `/api/events/admin` and other admin routes return 401 without a session (test with `curl`)
- [ ] Admin can create, edit, publish/unpublish, and delete events
- [ ] Dashboard stats (events, enrollments, revenue, paid vs free) match the database
- [ ] Mobile viewport shows the hamburger menu and single-column layouts
