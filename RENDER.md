# Deploy to Render

## Included setup

- `render.yaml` for Blueprint deploy
- Render Postgres database definition
- Backend web service definition
- Frontend static site definition

## Deploy steps

1. Push the repository to GitHub.
2. Open Render.
3. Click `New` -> `Blueprint`.
4. Select this repository.
5. Review the generated services.
6. Fill the required environment variables.
7. Click `Apply`.

## Values to fill in

### Backend

- `ADMIN_PASSWORD`
- `CORS_ORIGIN`

Example:

```text
https://sportmix-web.onrender.com
```

### Frontend

- `VITE_API_URL`

Example:

```text
https://sportmix-api.onrender.com/api
```

## Notes

- Free Render services can sleep after inactivity.
- The backend uses `/healthz` for the Render health check.
- `DATABASE_URL` is linked automatically from the Render Postgres service.
