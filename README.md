# History Before Us

Website for History Before Us, a multi-chapter student history organization:
a public site (home, events, a history timeline, chapters, team) and a
password-protected exec dashboard where non-technical execs manage
everything on it.

**Execs:** see [docs/exec-guide.md](docs/exec-guide.md) for how to use the
dashboard.

## Stack

- **Next.js** (App Router) + **TypeScript** + **Tailwind CSS v4**
- **Neon** Postgres + **Drizzle ORM**
- **zod** for form validation, **react-markdown** for exec-written text
- Admin auth via a single shared password (no separate auth service)
- Uploaded images are stored in Postgres (no extra storage service)

## What's where

```text
src/
  app/
    (site)/                # public site (shared header/footer layout)
      page.tsx               # home: hero, next events, today in history, team, FAQ, join
      events/                # events board + /events/[id] detail + .ics download
      history/               # timeline of facts (by era or by month, filter by region)
      chapters/              # chapter list + /chapters/[slug] pages
      team/                  # exec profiles grouped by chapter, past execs (/execs redirects here)
    images/[id]/           # serves uploaded images (immutable, cached forever)
    admin/
      login/                 # public login page
      _components/           # admin UI kit: form shell, fields, image upload, etc.
      (dashboard)/           # everything behind the password
        page.tsx               # dashboard with a to-do list of gaps
        events/ facts/ team/ chapters/   # list page, /new, /[id] edit page each
        content/               # home page text, contact links, "what we do", FAQ
  components/              # public UI shared with the admin live previews
  db/
    schema.ts              # tables (see below)
    migrate.ts             # migration runner (`npm run db:migrate`)
    seed.ts                # demo data for local development
  lib/                     # queries, formatting/time zone, validation, auth
  middleware.ts            # gates /admin pages
drizzle/                   # SQL migrations
```

### Data model

| Table | What it holds |
|---|---|
| `chapters` | Local branches (name, institution, city, description, contacts, meeting info) |
| `execs` | Structured profiles: name, pronouns, role, program, year, school, bio, links, photo, chapter, term, current/past, display order |
| `events` | Start/end, location, theme, chapter, RSVP link, cover image, description, post-event recap, draft/published |
| `facts` | Dated history entries: year (negative = BCE), month, day (all optional), headline, text, region, source, image |
| `site_content` | One-off copy (hero heading, intro, sign-up link, announcement banner). Keys are defined in `src/lib/site-content-fields.ts` |
| `links`, `pillars`, `faqs` | Ordered lists: contact/social links, "What we do" cards, FAQ |
| `images` | Uploaded images (resized in the browser before upload) |

Long text fields (bios, descriptions, answers) are stored as Markdown. Execs
never type Markdown syntax themselves; the editor's toolbar inserts it.

All dates are entered and displayed in **America/Toronto** time, whatever the
server's time zone (`src/lib/format.ts`).

## Getting started

1. `npm install`
2. Copy `.env.example` to `.env` and set `DATABASE_URL` (Neon pooled
   connection string) and `ADMIN_PASSWORD`.
3. `npm run db:migrate`: creates or upgrades the tables.
4. `npm run db:seed`: optional demo data. It refuses to run if the database
   already has content.
5. `npm run dev`, then open http://localhost:3000 and http://localhost:3000/admin.

## Database scripts

- `npm run db:migrate`: apply migrations in `drizzle/`. This handles databases
  originally created with `db:push` (no migration history) and is safe to rerun.
- `npm run db:generate`: after editing `schema.ts`, generate a new migration.
- `npm run db:studio`: browse data.

Use `db:generate` + `db:migrate` rather than `db:push` now that the live site
has real data.

## Deploying

Hosted on Vercel with Neon. Env vars: `DATABASE_URL`, `ADMIN_PASSWORD`
(optionally `ADMIN_SESSION_SECRET`).

**Run `npm run db:migrate` against the production database before deploying
a version with schema changes.** Some public pages are pre-rendered at build
time, so the build reads from the database. If the build fails because a
migration hasn't run, Vercel keeps serving the previous version.

Public pages are cached and refresh hourly. Any admin edit refreshes them
immediately.

## Security notes

- One shared password. When an exec leaves, change `ADMIN_PASSWORD` in
  Vercel; that also signs everyone out.
- Middleware protects admin *pages*. Admin *server actions* each call
  `requireAdmin()` themselves, because actions can be invoked from any route.
  Keep doing this for new actions.
