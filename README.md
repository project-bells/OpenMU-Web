# OpenMU Player Web

Player-facing website and secure registration gateway for OpenMU. The browser never receives the OpenMU API key. Account creation is validated against the Season 6 client limits and forwarded to the official OpenMU `POST /api/accounts` endpoint.

## Production setup

1. In the OpenMU admin panel, create an API key with the **Operator** role. Keep it secret.
2. Copy `.env.example` to `.env` and set `OPENMU_API_URL`, `OPENMU_API_KEY`,
   `POSTGRES_PASSWORD`, `SESSION_SECRET`, `VITE_CLIENT_DOWNLOAD_URL`, and
   `VITE_CLIENT_SIZE`. Generate `SESSION_SECRET` as at least 32 random
   characters. When OpenMU runs on the Docker host, use
   `http://host.docker.internal:<admin-port>` instead of `127.0.0.1` for
   `OPENMU_API_URL`.
3. Start the site with `docker compose up -d --build`.
4. Put a TLS reverse proxy or load balancer in front of port 8080. Protect the OpenMU admin panel separately.
5. Verify `/health/live`, `/health/ready`, live player count, duplicate-account handling, and an actual game login with a newly created account. The Compose stack creates the website's isolated PostgreSQL schema automatically.

`TRUST_PROXY=true` trusts the first `X-Forwarded-For` address for registration rate limiting. Enable it only behind a proxy which overwrites this header.

## Local verification

```powershell
npm ci
npm run check
```

To run the production gateway locally after building:

```powershell
$env:OPENMU_API_URL = "https://your-openmu-admin"
$env:OPENMU_API_KEY = "your-generated-operator-key"
npm start
```

The service fails to start if either secret runtime setting is missing or malformed. Registration transport failures never fall back to browser storage and are never reported as successful.

## Security and operations

- Registration is limited to five attempts per source address per minute and 8 KiB JSON bodies.
- API responses do not expose OpenMU error bodies, credentials, player names, or the upstream URL.
- CSP, frame, MIME-sniffing, referrer and browser-permission headers are set by the gateway.
- `/health/live` checks the web process; `/health/ready` checks access to the OpenMU API.
- Rotate the OpenMU API key if it appears in logs, browser bundles, commits, or screenshots.
