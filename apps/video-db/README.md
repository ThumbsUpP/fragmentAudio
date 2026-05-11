# Video Database Service — legacy

This service is the legacy TypeORM/Express database API used by the pre-v2 microservice architecture.

The v2 migration introduces `apps/api`, a modular Node monolith with Prisma and a new clean PostgreSQL schema. New backend work should target `apps/api`; this package remains only to keep the current system understandable while the migration is in progress.

## Current runtime scope

The actual service currently exposes:

- `GET /api/alignments` - get all alignment results
- `GET /api/alignments/:videoId` - get one alignment result by video ID
- `POST /api/alignments` - create or replace an alignment result
- `DELETE /api/alignments/:videoId` - delete an alignment result
- `GET /api/grammar/:videoId/:segmentId` - get a cached grammar explanation
- `POST /api/grammar` - create or update a grammar explanation

## Important notes

- Despite older documentation, this service no longer exposes the generic `/api/videos` JSON API.
- The implementation is PostgreSQL-oriented because the entities use `jsonb` columns.
- `synchronize: true` is still enabled in the legacy TypeORM datasource and should not be copied into v2.

## Setup

```bash
pnpm install
pnpm --filter video-db type-check
pnpm --filter video-db build
```

For local runtime, set `DATABASE_URL` to a PostgreSQL connection string.
