# Repository Structure

A single Next.js (App Router) application. The public site and the
exec-only admin dashboard live in the same app; `/admin` is protected by
`middleware.ts`, which checks a signed session cookie set after a shared
password login.

- `src/app` — pages and server actions
  - `src/app/admin` — admin dashboard (event CRUD)
- `src/db` — Drizzle schema, client, and seed data
- `src/lib` — auth and formatting helpers
- `drizzle` — generated SQL migrations
- `docs` — design and implementation notes

See the root `README.md` for setup and scripts.
