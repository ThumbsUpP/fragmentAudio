# FragmentAudio Dockerization Plan

## Goal

Containerize the current monolith-first runtime so the project can be started consistently with Docker Compose for local development and later adapted for VPS deployment.

The active runtime is:

- `apps/api`: Node/Express monolith on port `4000`
- `apps/stable-ts`: Python Flask alignment worker on port `5000`
- `apps/admin-web`: static administration frontend
- PostgreSQL: local Docker database for development, or external Neon in deployed environments

Legacy services (`apps/video-db`, `apps/llm-service`, and `apps/orchestration-service`) are not part of the target Docker runtime.

## Current State

- The root `Dockerfile` is stale and targets a Python app at the repository root.
- `apps/video-db/Dockerfile` and `apps/video-db/docker-compose.yml` target the legacy database service.
- There is no root `.dockerignore`.
- The local repository contains large generated directories such as `node_modules`, Python `venv`, `dist`, and upload artifacts.
- `apps/api` already builds with `pnpm --filter api build`.
- `apps/stable-ts` now has venv-based scripts and env-configurable host/port.
- `apps/admin-web` is static HTML/CSS/JS and does not need a build step.

## Target Compose Architecture

```text
postgres
  └─ local PostgreSQL database for development

stable-ts
  └─ Python Flask worker
  └─ exposes 5000
  └─ called by api at http://stable-ts:5000/stable-ts

api
  └─ Node/Express monolith
  └─ exposes 4000
  └─ connects to postgres through DATABASE_URL
  └─ calls stable-ts through STABLE_TS_URL

admin-web
  └─ static frontend served by nginx or another static server
  └─ exposes 5173 locally
  └─ browser calls api on port 4000
```

## Phase 1 - Build Context Hygiene

Add a root `.dockerignore` before any image work.

It should exclude at least:

```text
.git
node_modules
**/node_modules
apps/*/venv
apps/*/.venv
apps/*/dist
.turbo
.env
apps/api/.uploads
__pycache__
*.pyc
*.log
```

Also confirm upload artifacts are ignored by git, especially `apps/api/.uploads`.

## Phase 2 - API Image

Add `apps/api/Dockerfile`.

Requirements:

- Use a Node image compatible with the project, preferably Node 22 or current LTS.
- Enable `pnpm` through `corepack`.
- Install workspace dependencies from `pnpm-lock.yaml`.
- Build only the API package.
- Run `node dist/server.js` from `apps/api`.
- Expose port `4000`.

Runtime environment:

```env
API_PORT=4000
DATABASE_URL=postgresql://fragmentaudio:fragmentaudio@postgres:5432/fragmentaudio
DATABASE_POOL_SIZE=10
STABLE_TS_URL=http://stable-ts:5000/stable-ts
LLM_API_KEY=
LLM_API_URL=https://openrouter.ai/api/v1
LLM_MODEL=google/gemini-2.0-flash-001
LLM_TEMPERATURE=0.3
LLM_MAX_TOKENS=4000
LLM_HTTP_REFERER=
LLM_X_TITLE=FragmentAudio
```

Add a one-shot migration service or entrypoint step for:

```bash
pnpm --filter api db:migrate
```

Prefer a separate `api-migrate` Compose service so failed migrations are visible and do not hide inside API startup.

## Phase 3 - stable-ts Image

Add `apps/stable-ts/Dockerfile`.

Requirements:

- Use Python 3.12 or another verified compatible Python image.
- Install system packages required by audio decoding and `torchaudio` if needed.
- Install `apps/stable-ts/requirements.txt`.
- Copy only the stable-ts application files.
- Run `python app.py`.
- Expose port `5000`.

Runtime environment:

```env
STABLE_TS_HOST=0.0.0.0
STABLE_TS_PORT=5000
```

Expected risk:

- `torch`, `torchaudio`, `stable-ts`, and Whisper dependencies make this image large.
- Whisper model downloads may happen at runtime. Add a persistent cache volume, for example:

```yaml
volumes:
  whisper-cache:/root/.cache/whisper
```

## Phase 4 - Admin Web Image

Add `apps/admin-web/Dockerfile`.

Recommended approach:

- Use nginx alpine.
- Copy `index.html`, `app.js`, and `styles.css`.
- Serve on container port `80`.
- Map host port `5173` to container port `80`.

No build step is required.

Open question:

- Keep browser-to-API calls on `http://localhost:4000`, or add an nginx reverse proxy so the admin UI can call `/api` on the same origin.
- Same-origin proxying is cleaner for production, but direct port access is simpler for local Docker.

## Phase 5 - Compose File

Add root `docker-compose.yml` with:

- `postgres`
- `stable-ts`
- `api-migrate`
- `api`
- `admin-web`

Suggested service relationships:

- `api-migrate` depends on healthy `postgres`.
- `api` depends on successful `api-migrate` and started `stable-ts`.
- `admin-web` depends on `api`.

Suggested exposed ports:

```text
4000:4000  api
5000:5000  stable-ts, optional for debugging
5173:80    admin-web
5432:5432  postgres, optional for local database tools
```

## Phase 6 - Healthchecks

Current health status:

- `apps/api` has `GET /health`.
- `apps/stable-ts` does not have a dedicated health endpoint.

Recommended changes:

- Add `GET /health` to `apps/stable-ts`.
- Keep `GET /health` in `apps/api`.
- Optionally add database readiness to API health later, or add a separate `/ready` endpoint.

Compose healthchecks can then use:

```bash
curl -f http://localhost:4000/health
curl -f http://localhost:5000/health
```

## Phase 7 - Verification

After implementation, validate with:

```bash
docker compose build
docker compose up
```

Smoke checks:

```bash
curl http://localhost:4000/health
curl http://localhost:4000/api/videos?limit=1
curl http://localhost:5000/health
curl http://localhost:5173
```

Functional checks:

- Create a video shell through the API.
- Load the admin UI and confirm it can list videos.
- Run an audio/SRT import with `stable-ts` running.
- Confirm temporary upload files are cleaned up.
- Confirm failed imports create failed jobs with useful errors.

## Phase 8 - Cleanup

Once the new Docker runtime works:

- Remove or rename the stale root `Dockerfile`.
- Keep legacy `apps/video-db` Docker files only if the legacy service is still intentionally supported.
- Update `README.md` with Docker setup instructions.
- Update `docs/backend-migration-plan.md` to state that the monolith runtime is Docker-ready.
- Decide whether PM2 remains relevant for VPS deployment or whether Docker Compose replaces it.

## Open Decisions

- Use local Docker Postgres by default, or keep Neon as the default database for development.
- Serve admin-web directly from nginx, or proxy API requests through nginx.
- Use CPU-only Python images, GPU-enabled images, or separate profiles for `stable-ts`.
- Pre-download Whisper models during image build, or download/cache them at runtime.
- Keep legacy services in the workspace build/test flow, or exclude them from Docker-era default workflows.
