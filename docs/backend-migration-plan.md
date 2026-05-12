# FragmentAudio backend v2 migration plan

## Goal

The v2 backend will replace the current Node microservices (`video-db`, `llm-service`, and `orchestration-service`) with a modular Node monolith. The Python `stable-ts` service remains separate during the first migration steps because it owns the Whisper / audio-alignment runtime.

## Target architecture

```text
apps/api
  ├─ HTTP API for the future admin UI
  ├─ PostgreSQL access through Prisma
  ├─ LLM client and prompt orchestration
  ├─ audio/SRT import orchestration
  ├─ persistent processing jobs
  └─ stable-ts client

apps/stable-ts
  └─ Python alignment worker called by apps/api
```

The previous services stay available during the migration so each capability can be ported and verified independently.

## Chosen stack

- Node.js + TypeScript
- Express for the initial HTTP layer
- Prisma for PostgreSQL schema and migrations
- Zod for request/environment validation in the API implementation phase
- OpenAI-compatible SDK usage for the LLM module
- `stable-ts` kept as an external Python worker for now

## Database reset policy

The existing app is not in production use, so v2 starts from a clean database. No data migration from the current TypeORM schema is required.

## Target domain model

### Video

Canonical entity representing an imported learning fragment/video.

Fields to keep at minimum:

- `id`
- `externalId`
- `title`
- `sourceUrl`
- `sourceLanguage`
- `createdAt`
- `updatedAt`

### ProcessingJob

Persistent record for long-running imports and retries.

Statuses:

- `PENDING`
- `PROCESSING`
- `COMPLETED`
- `FAILED`

### Alignment

Represents one alignment run for a video.

### Segment

Represents a timed subtitle segment created from an alignment.

### Word

Represents a timed word/token inside a segment.

### Translation

Stores generated or manually edited translations for videos, segments, or words.

### GrammarExplanation

Stores generated grammar explanations linked to a segment and language.

## Migration phases

### Phase 1 — Preparation PR

- Add this migration plan.
- Add `apps/api` as the future monolith skeleton.
- Add Prisma schema for the target clean database.
- Defer Prisma client/Zod dependency activation to the database/API implementation PR if registry access is unavailable.
- Add environment examples.
- Fix obvious service URL defaults during the transition.
- Add missing type-check scripts where needed.
- Mark legacy docs as such where they no longer match the current code.

### Phase 2 — Database and read API

- Finalize the Prisma schema.
- Add migrations.
- Implement repositories/services for videos, alignments, segments, words, jobs, translations, and grammar explanations.
- Add read endpoints for videos and video detail pages.
- Until the package registry allows installing new Prisma/Zod artifacts, keep the Prisma schema as the target model and use a lightweight SQL runner for the first PostgreSQL-backed routes.

### Phase 3 — Import orchestration

- Implement `POST /api/videos/import`.
- Store uploaded files temporarily.
- Create a `ProcessingJob`.
- Call `stable-ts`.
- Persist alignment, segments, and words.
- Clean up uploaded files reliably.
- Expose `GET /api/jobs/:id` for UI polling.

### Phase 4 — LLM integration

- Move translation and grammar prompts into `apps/api`.
- Remove internal HTTP calls to `llm-service`.
- Store provider/model metadata on generated rows.
- Add regeneration endpoints for translations and grammar explanations.

### Phase 5 — Deprecate legacy services

- Remove `video-db` from the runtime once database routes are ported.
- Remove `llm-service` once LLM calls are local to `apps/api`.
- Remove `orchestration-service` once import jobs are local to `apps/api`.
- Keep `stable-ts` as the alignment worker until a later dedicated decision.

## Branch strategy

Migration PRs now target `master` directly. The current legacy services can remain during the transition, but runtime configuration should progressively favor `apps/api`.
