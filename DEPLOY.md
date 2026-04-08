# SportMix Deployment

## Quick start on VPS

1. Install Docker and Docker Compose plugin.
2. Copy the project to your server.
3. Create a real `.env` from `.env.example`.
4. Start the production stack:

```powershell
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

5. Open your server IP or domain in the browser.

## Recommended domain setup

- Point your domain A record to the VPS IP.
- Keep `FRONTEND_PORT=80` in `.env`.
- Set `CORS_ORIGIN=https://your-domain.com`.
- Keep `VITE_API_URL=/api` so frontend uses the same domain.

## Updating the app

```powershell
git pull
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

## Logs

```powershell
docker compose -f docker-compose.prod.yml --env-file .env logs -f
```

## Stop

```powershell
docker compose -f docker-compose.prod.yml --env-file .env down
```

## Important

- Do not commit the real `.env`.
- Change `POSTGRES_PASSWORD`, `JWT_SECRET`, and `ADMIN_PASSWORD` before first launch.
- The frontend container serves static files with nginx and proxies `/api` requests to the backend container.
