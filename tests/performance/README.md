# Performance / smoke tests (k6)

Grafana [k6](https://grafana.com/docs/k6/) scripts that hit the Weavit API over HTTP. There are no Jest/Vitest unit tests here — these are live-endpoint checks against a running API (local Docker or production).

## Prerequisites

1. **k6 installed** on the machine that runs the scripts  
   - macOS: `brew install k6`  
   - Linux: see [k6 install docs](https://grafana.com/docs/k6/latest/set-up/install-k6/)
2. **API reachable** at `BASE_URL` (local default `http://localhost:4000` via `docker compose up`)
3. **Clerk session JWT** for authenticated scripts (`smoke.ts`, `testGetProjects.ts`)  
   - Use a session token from an already registered user  
   - Pass it as `API_TOKEN` (Bearer)

Get a token from a signed-in browser session (Clerk session JWT), or from whatever you already use for API calls. Do **not** commit tokens.

## Scripts

| File | What it does | Auth |
| --- | --- | --- |
| `health.ts` | `GET /health` only | none |
| `testGetProjects.ts` | `GET /projects` only | `API_TOKEN` (existing DB user) |
| `smoke.ts` | Full API smoke: public routes, auth bootstrap (`POST /syncUser`), CRUD for habits/todos/projects/deadlines/calendars, then cleanup | `API_TOKEN` |

Supporting pieces:

| Path | Role |
| --- | --- |
| `config/enviornment.ts` | Shared `BASE_URL` / `CLERK_TOKEN` defaults for the generated client |
| `utils/client.ts` | Wraps `WeavitPlatformAPIClient` with those env defaults |
| `generated/weavitPlatformAPI.ts` | OpenAPI → k6 client (via `@grafana/openapi-to-k6`) |
| `history/` | Past smoke run notes (metrics snapshots) |

## Environment variables

| Variable | Required by | Description |
| --- | --- | --- |
| `BASE_URL` | all scripts | API origin, no trailing slash (e.g. `http://localhost:4000` or `https://api.weavit.tech`) |
| `API_TOKEN` | `smoke.ts`, `testGetProjects.ts` | Clerk session JWT (`Authorization: Bearer …`) |
| `VUS` | `smoke.ts`, `testGetProjects.ts` (optional) | Virtual users (default `1`) |
| `ITERATIONS` | `smoke.ts`, `testGetProjects.ts` (optional) | Total iterations shared across VUs (default `1`) |
| `LEETCODE_USERNAME` | `smoke.ts` (optional) | If set, also hits `GET /leetcode/:username` |
| `CLERK_TOKEN` | generated client helpers only | Same idea as `API_TOKEN`; used by `config/enviornment.ts` |

## Run commands

Run from the **repo root** (or `cd tests/performance` and adjust paths).

### Health (no auth)

```bash
BASE_URL=http://localhost:4000 \
k6 run tests/performance/health.ts
```

`health.ts` hard-codes `vus: 5` and `iterations: 100`.

### GET /projects only

Uses an existing user’s token. Does **not** call `POST /syncUser`. The Clerk user behind the JWT must already exist in the API DB (synced previously).

```bash
BASE_URL=http://localhost:4000 \
API_TOKEN='paste-clerk-session-jwt-here' \
k6 run tests/performance/testGetProjects.ts
```

With load:

```bash
BASE_URL=http://localhost:4000 \
API_TOKEN="$CLERK_SESSION_TOKEN" \
VUS=5 ITERATIONS=50 \
k6 run tests/performance/testGetProjects.ts
```

Checks:

- status `200`
- response body is a JSON array

### Full smoke

Creates fixtures, exercises nested project routes, then deletes what the API allows. Calls `POST /syncUser` first so a brand-new Clerk user can work.

```bash
BASE_URL=http://localhost:4000 \
API_TOKEN="$CLERK_SESSION_TOKEN" \
k6 run tests/performance/smoke.ts
```

Production-style example:

```bash
BASE_URL=https://api.weavit.tech \
API_TOKEN="$CLERK_SESSION_TOKEN" \
VUS=1 ITERATIONS=1 \
k6 run tests/performance/smoke.ts
```

Optional LeetCode probe:

```bash
BASE_URL=http://localhost:4000 \
API_TOKEN="$CLERK_SESSION_TOKEN" \
LEETCODE_USERNAME=neetcode \
k6 run tests/performance/smoke.ts
```

`smoke.ts` groups (in order): public → auth bootstrap → habits → todos → projects (incl. phases/tasks/notes) → deadlines → calendars + timeline → cleanup.

There is **no** env flag to run a single smoke group; use `testGetProjects.ts` (or a dedicated script) for one route.

## Local API

Typical local stack:

```bash
docker compose up
```

API listens on `0.0.0.0:4000`. Point `BASE_URL` at `http://localhost:4000`.

If `@prisma/client` types are missing inside the container after volume mounts, regenerate in the running container:

```bash
docker compose exec api pnpm --filter api exec prisma generate
```

(Host IDE types need the same generate on the host `node_modules` if you edit API code locally.)

## Auth notes

- **`testGetProjects.ts`**: Bearer token only. User must already be in DB. No sync.
- **`smoke.ts`**: Bearer token + `POST /syncUser` at the start of each iteration so fixtures attach to a real user row.
- Expired / wrong-audience JWTs → `401` / failed checks. Refresh the session token and rerun.

## Thresholds (quick reference)

| Script | Failures | Checks |
| --- | --- | --- |
| `testGetProjects.ts` | `http_req_failed` rate `< 0.01` | checks rate `> 0.99` |
| `smoke.ts` | `http_req_failed` rate `< 0.05` | checks rate `> 0.95` |
| `health.ts` | none configured | status `200` check only |

## Regenerating the OpenAPI k6 client

Dev dependency: `@grafana/openapi-to-k6` (see `package.json`). Regenerate from the API OpenAPI spec when routes change, writing into `generated/weavitPlatformAPI.ts`. The hand-written scripts (`health`, `smoke`, `testGetProjects`) call `k6/http` directly and do not require the generated client.

## History

Past run write-ups live under `history/` (e.g. smoke metrics for a given date/VU/iteration setup). Add new notes there when you care about comparing load runs over time.
