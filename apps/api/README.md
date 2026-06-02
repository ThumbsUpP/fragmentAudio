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
- `GET /api/videos/:videoId/translations`
- `POST /api/videos/:videoId/translations/regenerate`
- `POST /api/videos/:videoId/translations`
- `GET /api/jobs`
- `GET /api/jobs/:jobId`
- `GET /api/segments/:segmentId/words`
- `GET /api/segments/:segmentId/translations`
- `POST /api/segments/:segmentId/translations/regenerate`
- `POST /api/segments/:segmentId/translations`
- `GET /api/segments/:segmentId/grammar`
- `POST /api/segments/:segmentId/grammar/regenerate`
- `POST /api/segments/:segmentId/grammar`
- `GET /api/words/:wordId`
- `GET /api/words/:wordId/translations`
- `POST /api/words/:wordId/translations/regenerate`
- `POST /api/words/:wordId/translations`

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

Create a segment translation:

```bash
curl -X POST http://localhost:4000/api/segments/segment_123/translations \
  -H "Content-Type: application/json" \
  -d '{"language":"fr","text":"Traduction du segment","provider":"manual"}'
```

Regenerate a segment translation through the local monolith LLM client:

```bash
curl -X POST http://localhost:4000/api/segments/segment_123/translations/regenerate \
  -H "Content-Type: application/json" \
  -d '{"language":"fr"}'
```

Store a grammar explanation:

```bash
curl -X POST http://localhost:4000/api/segments/segment_123/grammar \
  -H "Content-Type: application/json" \
  -d '{"language":"fr","answerMarkdown":"Explication grammaticale."}'
```

Regenerate a grammar explanation through the local monolith LLM client:

```bash
curl -X POST http://localhost:4000/api/segments/segment_123/grammar/regenerate \
  -H "Content-Type: application/json" \
  -d '{"language":"fr"}'
```

## v2 migration

See [`../../docs/backend-migration-plan.md`](../../docs/backend-migration-plan.md).
