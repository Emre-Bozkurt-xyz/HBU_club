# Repository Structure

This repo is structured as a monorepo so the public website and admin subdomain can be deployed separately while still sharing database and UI code.

- `apps/web`: public-facing site
- `apps/admin`: exec-only admin dashboard
- `packages/db`: shared database access
- `packages/ui`: shared components
- `prisma`: PostgreSQL schema and migrations
- `docs`: design and implementation notes
