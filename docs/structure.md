# Repository Structure

A single Next.js (App Router) application. The public site and the
exec-only admin dashboard live in the same app; `/admin/:path*` is protected
by `src/middleware.ts`, which checks a signed session cookie set after a shared
password login. `/admin/login` is explicitly excluded so the login form
itself stays reachable. (The middleware must live in `src/` — this project
uses a `src/` directory, so a root-level `middleware.ts` is ignored by
Next.js and the gate silently does nothing.)

- `src/app` — pages and server actions
  - `src/app/page.tsx` — home page: intro (from `siteContent`), an upcoming
    events preview, "this month in history" facts, and a contact section
  - `src/app/events` — public events board: upcoming list plus a past-events
    archive
  - `src/app/execs` — public team page
  - `src/app/icon.svg`, `src/app/opengraph-image.tsx` — favicon and generated
    link-preview image
  - `src/app/admin` — password-protected admin area
    - `login/` — public login page
    - `actions.ts` — login/logout server actions
    - `delete-button.tsx` — shared client component that confirms before any
      destructive admin action
    - `page.tsx` — redirects `/admin` to `/admin/events`
    - `(dashboard)/` — route group with a shared nav layout (doesn't affect
      the URL); holds the actual admin sub-pages, each with its own
      `page.tsx` + `actions.ts`:
      - `events/` — event CRUD (create, edit, delete)
      - `execs/` — exec CRUD (name, role, bio)
      - `facts/` — fact CRUD, each tagged with a month (1-12)
      - `content/` — one form that upserts every `siteContent` key (intro
        paragraph, contact email/Instagram/Discord, meeting info)
- `src/db` — Drizzle schema, client, and seed data
  - `schema.ts` defines `events`, `execs`, `facts` (now with a `month`
    column), and `siteContent` (key/value store for editable copy)
- `src/lib` — auth, formatting, and site-content helpers
  - `site-content.ts` — the fixed list of known `siteContent` keys (with
    label + input type, for rendering the admin form) and a
    `getSiteContent()` helper that reads all rows into a defaulted object
- `drizzle` — generated SQL migrations (run `npm run db:generate` after
  schema changes; migrations are schema-only and don't need a live DB)
- `docs` — design and implementation notes

See the root `README.md` for setup and scripts.
