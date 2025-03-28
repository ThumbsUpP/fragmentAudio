# FragmentAudio Services

This monorepo contains multiple TypeScript services managed using PM2 process manager.

## Services

- **llm-service**: LLM operations service
- **orchestration-service**: Service orchestration
- **stable-ts**: Whisper-based transcription service
- **video-db**: Video database operations

## Process Management with PM2

The services are managed using PM2 with configurations defined in `ecosystem.config.js`.

### Service Configuration

Each service is configured with:
- Source map support for better debugging
- Watch mode for development
- Environment variables loaded from respective `.env` files
- Logging to `./logs` directory

Special configurations:
- `stable-ts` runs without resource limitations due to Whisper's intensive processing needs
- Other services have:
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
pm2 start ecosystem.config.js --only service-name
```

View logs:
```bash
pm2 logs                    # All logs
pm2 logs service-name       # Specific service logs
```

Monitor services:
```bash
pm2 monit
```

Restart services:
```bash
pm2 restart ecosystem.config.js          # All services
pm2 restart ecosystem.config.js --only service-name  # Specific service
```

Stop services:
```bash
pm2 stop ecosystem.config.js             # All services
pm2 stop service-name                    # Specific service
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

Each service requires its own `.env` file in its respective directory:
- `./apps/llm-service/.env`
- `./apps/orchestration-service/.env`
- `./apps/stable-ts/.env`
- `./apps/video-db/.env`
