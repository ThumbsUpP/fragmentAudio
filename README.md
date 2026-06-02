# FragmentAudio Backend

This monorepo is migrating from a Node microservice backend to the v2 monolith in `apps/api`.
The default runtime is now:

- **api**: Node/Express monolith for database routes, import jobs, translations, and grammar generation
- **stable-ts**: Python Whisper/stable-ts alignment worker called by `api`
- **admin-web**: static content administration frontend for `api`

The legacy Node services (`video-db`, `llm-service`, and `orchestration-service`) remain in the repo for reference during migration cleanup, but they are no longer started by the default PM2 configuration.

See `docs/backend-migration-plan.md` for the migration plan.

## Local Setup

Install dependencies and build the API:

```bash
pnpm install
pnpm --filter api build
```

Create environment files:

```bash
cp .env.example apps/api/.env
cp .env.example apps/stable-ts/.env
```

Start the API and the admin frontend:

```bash
pnpm --filter api start
pnpm --filter admin-web start
```

Open the admin frontend at `http://localhost:5173`.

## Process Management with PM2

The default runtime processes are managed using PM2 with configurations defined in `ecosystem.config.js`.

### Service Configuration

Each runtime process is configured with:
- Source map support for better debugging
- Watch mode for development
- Environment variables loaded from respective `.env` files
- Logging to `./logs` directory

Special configurations:
- `stable-ts` runs without resource limitations due to Whisper's intensive processing needs
- `api` has:
  - Memory limit: 512MB
  - Max restarts: 10
  - Min uptime: 5s

### Common Commands

Start all services:
```bash
pm2 start ecosystem.config.js
```

Start a specific service:
```bash
pm2 start ecosystem.config.js --only api
pm2 start ecosystem.config.js --only stable-ts
```

View logs:
```bash
pm2 logs                    # All logs
pm2 logs api                # API logs
pm2 logs stable-ts          # Alignment worker logs
```

Monitor services:
```bash
pm2 monit
```

Restart services:
```bash
pm2 restart ecosystem.config.js          # All services
pm2 restart ecosystem.config.js --only api  # Specific service
```

Stop services:
```bash
pm2 stop ecosystem.config.js             # All services
pm2 stop api                             # Specific service
```

### Deployment

Two deployment environments are configured:
- Production: Deploys from main branch
- Development: Deploys from develop branch

Deploy to an environment:
```bash
pm2 deploy ecosystem.config.js production    # For production
pm2 deploy ecosystem.config.js development   # For development
```

## Logs

All service logs are stored in the `./logs` directory:
- Error logs: `./logs/[service-name]-error.log`
- Output logs: `./logs/[service-name]-out.log`

## Environment Variables

The default runtime reads environment variables from:
- `./apps/api/.env`
- `./apps/stable-ts/.env`

`apps/api` owns the database connection and LLM provider configuration. `stable-ts` remains separate because it owns the Python Whisper alignment runtime.
