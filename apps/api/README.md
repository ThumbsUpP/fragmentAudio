# FragmentAudio API v2

This package is the new modular Node monolith for the v2 backend migration.

## Current scope

This first version is intentionally a skeleton. It provides:

- Express application setup
- typed environment defaults for local development
- Prisma schema for the clean v2 PostgreSQL database
- `/health` endpoint
- placeholder `/api/videos` route

The legacy services remain available while features are migrated into this package.

> Note: the Prisma schema is staged now, but the generated Prisma client and Zod request validators are planned for the database/API implementation PR. This preparation PR avoids introducing unavailable registry dependencies while still documenting the v2 target shape.

## Local setup

```bash
cp apps/api/.env.example apps/api/.env
pnpm --filter api type-check
pnpm --filter api build
pnpm --filter api start
```

## v2 migration

See [`../../docs/backend-migration-plan.md`](../../docs/backend-migration-plan.md).
