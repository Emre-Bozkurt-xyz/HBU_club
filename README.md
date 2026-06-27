# HBU Club

A monorepo structure for a history club website focused on the land we live on and world history.

## Planned apps

- `apps/web`: Public website with home, events, history facts, and exec profiles.
- `apps/admin`: Separate subdomain app for exec-only event and member management.

## Shared packages

- `packages/db`: Database client, queries, and persistence helpers.
- `packages/ui`: Shared UI components used by both apps.

## Database

- `prisma/schema.prisma`: PostgreSQL data model for events, execs, members, and facts.

## Suggested page map

- Home: who we are and what we do.
- Upcoming events: important dates, themes, and locations.
- History facts: rotating random facts.
- Execs: short bios for each executive.
- Admin: manage events and participating members.

## Structure

```text
HBU_club/
  apps/
    web/
      src/app/
    admin/
      src/app/
  packages/
    db/
    ui/
  prisma/
  docs/
```
