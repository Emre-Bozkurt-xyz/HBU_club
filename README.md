# History Before Us

Website for the History Before Us club: a public landing page, an events
board, a team page, and a password-protected admin dashboard to manage events.

## Stack

- **Next.js** (App Router) + **TypeScript** + **Tailwind CSS** — one app
- **Neon** — hosted Postgres
- **Drizzle ORM** — typed queries and migrations
- Admin auth via a single shared password (no separate auth service)

## Project layout

```text
src/
  app/
    page.tsx            # landing page
    events/             # public events board
    execs/              # team profiles
    admin/              # password-protected event dashboard
      login/
      actions.ts        # server actions (login + event CRUD)
  db/
    schema.ts           # Drizzle tables: events, execs, facts
    index.ts            # db client
    seed.ts             # sample data
  lib/
    auth.ts             # password check + signed session cookie
    format.ts           # date helpers
middleware.ts           # gates everything under /admin
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
   npm run db:seed     # optional: insert sample events
   ```

5. **Run it.**

   ```bash
   npm run dev
   ```

   - Public site: http://localhost:3000
   - Admin: http://localhost:3000/admin (log in with `ADMIN_PASSWORD`)

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
