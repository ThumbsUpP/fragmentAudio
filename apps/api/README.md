# FragmentAudio API v2

This package is the new modular Node monolith for the v2 backend migration.

## Current scope

This package now provides the first database-backed API slice:

- Express application setup
- typed environment defaults for local development
- staged Prisma schema for the clean v2 PostgreSQL database
- lightweight SQL migration runner while Prisma CLI/client activation is pending
- SQL migration companion at `prisma/migrations/000001_init_v2_schema/migration.sql`
- `GET /health`
- `GET /api/videos`
- `POST /api/videos`
- `GET /api/videos/:videoId`
- `GET /api/videos/:videoId/alignment`
- `GET /api/videos/:videoId/segments`
- `GET /api/jobs`
- `GET /api/jobs/:jobId`

The legacy services remain available while features are migrated into this package.

> Note: the Prisma schema is the source-of-truth target model, but generated Prisma Client and Zod request validators are still planned for a follow-up once registry access allows installing the missing packages. The current implementation uses the PostgreSQL schema defined by the same model through a small SQL migration runner.

## Local setup

```bash
cp apps/api/.env.example apps/api/.env
pnpm --filter api type-check
pnpm --filter api build
pnpm --filter api db:migrate
pnpm --filter api start
```

## API examples

Create a video shell:

```bash
curl -X POST http://localhost:4000/api/videos \
  -H "Content-Type: application/json" \
  -d '{"externalId":"demo-001","title":"Demo fragment","sourceLanguage":"zh"}'
```

List videos:

```bash
curl http://localhost:4000/api/videos?limit=20&offset=0
```

Poll jobs:

```bash
curl http://localhost:4000/api/jobs
```

## v2 migration

See [`../../docs/backend-migration-plan.md`](../../docs/backend-migration-plan.md).
