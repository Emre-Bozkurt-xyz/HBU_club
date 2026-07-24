# Implementation Plan — History Before Us

This document captures the agreed scope, decisions, and work breakdown for
bringing the club website to what the execs described. It builds on the
existing Next.js + Drizzle + Postgres scaffolding.

## Source brief (from the execs)

> A club that talks about the history of different regions. The site needs:
> - A **main page** with: what we do, upcoming events, contact information,
>   and some cool facts about the particular month in history.
> - An **exec page** describing all the execs and their roles.
> - An **admin** area (under the same site) where execs can add/remove events
>   and exec information.

## Decisions made

| Question | Decision |
|---|---|
| Hosting | **Vercel** (Hobby / free tier) |
| Database | **Neon Postgres** (free tier) — keep existing Drizzle Postgres stack |
| Admin location | **`/admin`** path (not a separate subdomain) |
| Editable content | Intro blurb **and** contact info editable in admin |
| Monthly facts | Facts **tagged by month**, home auto-shows the current month |
| Exec profiles | **Text-only** (name, role, bio) — no photo uploads for now |
| Auth model | Single **shared password** (rotate when an exec leaves) |
| Improvements | All three approved: past-events archive, delete confirmation, link-preview + favicon |

## Current state (already built)

- Next.js (App Router) + TypeScript + Tailwind + Drizzle + Postgres.
- Tables: `events`, `execs`, `facts`.
- Public pages: home (`/`), events (`/events`), execs (`/execs`).
- Admin: password login + **event** add/edit/delete at `/admin`.
- Auth: signed-cookie session + `middleware.ts` gating `/admin/*`.
- Seed script and `.env.example`.

## Scope of work

### 1. Database schema (`src/db/schema.ts`)

- **`facts`**: add a `month` column — integer `1`–`12`, not null. Each fact
  belongs to a calendar month.
- **New `siteContent` table**: key/value store for editable copy. A fixed set
  of known keys is defined in code (each with a label + input type) so the
  admin form renders one field per key. Initial keys:
  - `intro` — the main "what we do" paragraph
  - `contact_email`
  - `contact_instagram`
  - `contact_discord` (optional)
  - `meeting_info` — where/when the club meets
- Generate a Drizzle migration (`npm run db:generate`) for these changes.
- Update `seed.ts`: give sample facts a `month`, and seed default
  `siteContent` values.

### 2. Home page (`src/app/page.tsx`) — becomes data-driven (async)

- **What we do**: intro paragraph pulled from `siteContent.intro` (falls back
  to a default string if unset). The three existing "feature cards" stay as
  static design elements.
- **Upcoming events preview**: the next 2–3 events, with a "See all events"
  link to `/events`. Reuses the events query (future-dated, ascending).
- **This month in history**: facts where `month = current month`, rendered as
  a small list. Empty state if none for this month.
- **Contact section**: email / Instagram / Discord / meeting info from
  `siteContent`.

### 3. Admin dashboard — expand from events-only to a full panel

Add a shared admin nav across these sub-routes (all already gated by
`middleware.ts`, since it matches `/admin/:path*`):

- **`/admin/events`** — existing event CRUD, moved under the nav.
- **`/admin/execs`** — *new*: add / edit / remove execs (name, role, bio).
- **`/admin/facts`** — *new*: add / edit / remove facts, each tagged with a
  month (dropdown 1–12).
- **`/admin/content`** — *new*: edit the intro blurb + contact fields
  (one form over the `siteContent` keys).

Server actions live alongside each section (extending the pattern in
`src/app/admin/actions.ts`): exec CRUD, fact CRUD, and a `siteContent` upsert.
Login / logout / middleware are unchanged.

### 4. Public exec page (`src/app/execs/page.tsx`)

No change needed — it already reads execs from the DB, so it will display
whatever the execs manage in `/admin/execs`.

## Improvements (all approved)

1. **Past events archive** — on `/events`, add a collapsed "Past events"
   section below the upcoming list (past-dated events, descending). Fitting for
   a history club, and prevents the club's own history from vanishing.
2. **Delete confirmation** — guard admin deletes (events, execs, facts) with a
   confirmation step so a misclick can't silently destroy data.
3. **Link-preview + favicon** — Open Graph / Twitter meta tags (title,
   description, image) plus a favicon/logo, so the link looks polished when
   shared in group chats and bios.

## Explicitly out of scope (for now)

- Contact **form** (would need an email-sending service) — the brief asks for
  contact *info*, which is display-only.
- Per-exec logins / accounts — shared password is sufficient for a club.
- Photo uploads for execs — text-only, per decision above.

## Operational notes

- **Shared password**: security model is one `ADMIN_PASSWORD`. When an exec
  leaves, rotate it in Vercel's env vars (this also logs everyone out, since
  the session cookie is derived from the password).
- **Env vars needed** (local `.env` and Vercel project settings):
  `DATABASE_URL` (Neon pooled string), `ADMIN_PASSWORD`, and optionally
  `ADMIN_SESSION_SECRET`.

## Suggested build order

1. Schema: add `facts.month` + `siteContent`; generate migration; update seed.
2. Admin content section (`/admin/content`) + `siteContent` read helper.
3. Home page rebuild (intro + events preview + monthly facts + contact).
4. Admin execs section (`/admin/execs`).
5. Admin facts section (`/admin/facts`).
6. Admin nav + move events under `/admin/events`.
7. Improvements: past-events archive, delete confirmations, OG tags + favicon.
8. Update `README.md` and `docs/structure.md`.

## Deployment checklist

1. Create a Neon project; copy the **pooled** connection string.
2. Push repo to GitHub; import into Vercel.
3. Set `DATABASE_URL` + `ADMIN_PASSWORD` in Vercel env vars.
4. Run `npm run db:push` (or apply the migration) against the Neon DB.
5. Optionally `npm run db:seed` for starter content.
6. Verify: public site loads, `/admin` login works, CRUD persists.
