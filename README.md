# History Before Us

Website for the History Before Us club: a data-driven landing page (intro,
upcoming events, this month in history, contact info), an events board with
a past-events archive, a team page, and a password-protected admin dashboard
to manage events, execs, facts, and site copy.

## Stack

- **Next.js** (App Router) + **TypeScript** + **Tailwind CSS** — one app
- **Neon** — hosted Postgres
- **Drizzle ORM** — typed queries and migrations
- Admin auth via a single shared password (no separate auth service)

## Project layout

```text
src/
  app/
    page.tsx             # landing page (intro, events preview, monthly facts, contact)
    icon.svg              # favicon placeholder
    opengraph-image.tsx   # generated OG/Twitter link-preview image
    events/               # public events board (upcoming + past archive)
    execs/                # team profiles
    admin/
      login/               # public login page
      actions.ts           # login/logout server actions
      delete-button.tsx    # shared client component: confirm() before delete
      page.tsx             # redirects /admin -> /admin/events
      (dashboard)/         # nav-wrapped admin sub-pages (route group)
        layout.tsx          # shared admin nav + sign out
        events/             # event CRUD (moved from /admin)
        execs/               # exec CRUD
        facts/               # fact CRUD (tagged by month)
        content/             # edit siteContent (intro + contact info)
  db/
    schema.ts           # Drizzle tables: events, execs, facts, siteContent
    index.ts            # db client
    seed.ts             # sample data
  lib/
    auth.ts             # password check + signed session cookie
    format.ts           # date helpers
    site-content.ts     # known siteContent keys + defaulted read helper
  middleware.ts         # gates everything under /admin (must live in src/)
drizzle/                # generated SQL migrations
```

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create a database.** Sign up at [neon.tech](https://neon.tech), create a
   project, and copy the pooled connection string.

3. **Set environment variables.** Copy `.env.example` to `.env` and fill in
   `DATABASE_URL` and `ADMIN_PASSWORD`.

   ```bash
   cp .env.example .env
   ```

4. **Create the tables and seed sample data.**

   ```bash
   npm run db:push     # apply the schema to your database
   npm run db:seed     # optional: insert sample events, execs, facts, content
   ```

5. **Run it.**

   ```bash
   npm run dev
   ```

   - Public site: http://localhost:3000
   - Admin: http://localhost:3000/admin (log in with `ADMIN_PASSWORD`; you'll
     land on `/admin/events`, with nav for Events, Execs, Facts, and Content)

## Database scripts

- `npm run db:push` — push the schema directly to the database (best for early
  dev when you don't care about migration history)
- `npm run db:generate` — generate a SQL migration from schema changes
- `npm run db:migrate` — apply generated migrations
- `npm run db:studio` — open Drizzle Studio to browse data
- `npm run db:seed` — insert sample rows

## Deploying

Deploy to [Vercel](https://vercel.com): import the repo and add the same
environment variables (`DATABASE_URL`, `ADMIN_PASSWORD`). Neon and Vercel both
have free tiers that comfortably cover a club site.
