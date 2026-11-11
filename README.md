# Weavit

**Context-aware agentic workspace** — chat with an assistant that already knows your habits, roadmaps, todos, deadlines, and calendar, then mutates that real workspace through allowlisted actions (not free-form tools).

| | |
| --- | --- |
| **Live web** | [weavit.tech](https://weavit.tech) |
| **Live API** | [api.weavit.tech](https://api.weavit.tech) · [Swagger](https://api.weavit.tech/apidocs) |
| **Agent** | `/agent` (full page + live roadmap preview) · dashboard drawer for quick check-ins |
| **Local** | Web `:3000` · API `:4000` |

---

## Highlights (60-second scan)

- **Agentic product** — LLM gets a full workspace snapshot + “now”; replies are grounded in real titles/dates; mutations are an allowlisted action schema executed via RTK → Express.
- **Safe roadmap UX** — multi-phase plans render in a **live preview**; user confirms **Add to workspace** → one nested `POST /projects` (phases/tasks/notes). No unbounded tool loop.
- **Typed end-to-end contract** — OpenAPI → Zod (API) + generated client types (`@weavit/api-contract` / `@weavit/api-types`) + RTK Query.
- **Auth that scopes data** — Clerk sessions; `POST /syncUser` upserts Prisma `User`; every resource query is user-scoped.
- **API performance practice** — Redis read-through on GETs; k6 smoke + **read-only** smoke; measured **p95 1.86s → ~309ms** on read path (20 VUs × 400 iters) after caching.
- **Shipped stack** — Next.js 16 / React 19, Express 5, Prisma/Neon, Redis, Groq, Doppler secrets, Docker, **ECS deploy on `main`**.

---

## What this project demonstrates (capabilities)

| Skill | Evidence in this repo |
| --- | --- |
| Product / agent design | Guest vs signed-in prompts; state-grounded Q&A; preview-before-write for roadmaps |
| Full-stack TypeScript | Monorepo (`apps/web`, `apps/api`, shared packages) |
| API design | Resource APIs, nested project create, OpenAPI + Swagger |
| Client data layer | RTK Query `createApi`, Clerk `prepareHeaders`, tagTypes for cache |
| AI integration | Structured JSON output, Zod action schema, action executor |
| Data modeling | Prisma schema: projects hierarchy, habit streaks vs journal logs, calendars |
| Caching | Redis get/set on hot GETs; documented stale-cache tradeoff |
| Observability / quality | pino-http, Zod response validation, k6 thresholds |
| DevOps | Doppler, Docker Compose (dev), GitHub Actions → ECR → ECS |

---

## Product overview

### Problem

Productivity tools scatter habits, plans, deadlines, and calendars. Assistants that don’t see that state invent answers or require brittle plugins. Weavit keeps **one workspace** and puts an assistant **inside** it.

### Core loop

1. User signs in (Clerk) → web syncs user (`POST /syncUser`).
2. Workspace UI loads habits / plans / todos / deadlines / timeline via RTK Query.
3. Agent loads the **same snapshot**, plus current datetime.
4. Model returns `{ message, actions[], preview? }`.
5. UI shows markdown; runs allowlisted actions; shows roadmap preview until the user saves.

### Feature surface

| Area | User-facing capability | Notes |
| --- | --- | --- |
| **Agent** | Ask what’s due, log habits, scaffold plans, mutate workspace | Allowlisted actions only |
| **Roadmaps / plans** | Phased projects with tasks & notes | Nested create from preview |
| **Habits** | Check-ins, streaks, journal | Completion = `completedDates[]`; logs ≠ done |
| **Todos** | Prioritized task list | Status / due / tags |
| **Deadlines** | Course-style due items | Completion toggle |
| **Timeline** | Week grid, calendars + events | Tone / visibility per calendar |
| **Drafts** | Scratch / agent-assisted thinking | Partially productized |
| **Landing / guest agent** | Explain product without an account | No workspace mutations |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Next.js (apps/web)                                         │
│  ├─ Workspace pages ── RTK Query ─────────────────────┐     │
│  ├─ Agent runtime                                      │     │
│  │    snapshot (RTK) + prompt + Groq                   │     │
│  │    → { message, actions, preview }                  │     │
│  │    → ActionCard / mutations / preview panel         │     │
│  └─ Clerk token → prepareHeaders                       │     │
└────────────────────────────────────┬────────────────────┘
                                     │ HTTPS + Bearer JWT
┌────────────────────────────────────▼────────────────────┐
│  Express (apps/api)                                     │
│  features/*  routes → controllers                       │
│  Zod validate ↔ OpenAPI                                 │
│  Prisma → Neon Postgres                                 │
│  Redis read-through on GET lists/details                │
└─────────────────────────────────────────────────────────┘
```

**Contract spine:** `apps/api/openapi.json` → API Zod (`src/zod/api.ts`) + `@weavit/api-contract` / `@weavit/api-types` for the web.

---

## Agent system (engineering detail)

**Location:** `apps/web/features/agent/` · UI: `apps/web/app/agent/`, dashboard drawer.

| Piece | Responsibility |
| --- | --- |
| `prompt.agent.ts` / `prompt.guest.agent.ts` | System rules: ground in `state`, never invent ids, preview rules for roadmaps |
| `schema.agent.ts` | Zod discriminated union of `actionType`s + optional plan `preview` |
| `actions.agent.ts` | Snapshot builder + execute allowlisted actions via RTK mutations |
| `use-agent-runtime.ts` | Wires queries/mutations, runs a turn, returns message/actions/preview/failures |
| `plan-from-preview.ts` | Maps preview → nested `CreateProject` payload |
| `ActionCard.tsx` | Surfaces proposed / executed actions in the chat UI |

### Turn shape

Input conceptually:

- `trigger` — user message  
- `now` — server/client datetime for “today” / overdue  
- `state` — `{ habits, plans (phases/tasks), todos, deadlines, calendars, events }`

Output (JSON only):

```json
{
  "message": "markdown for the user",
  "actions": [ { "actionType": "...", "data": { } } ],
  "preview": null
}
```

### Allowlisted actions

`create_habit`, `toggle_habit`, `create_habit_log`,  
`create_todo`, `patch_todo`, `delete_todo`,  
`create_deadline`, `patch_deadline`,  
`create_project`, `patch_project`, `create_phase`, `create_task`, `patch_task`, `create_task_log`,  
`create_calendar_event`, `patch_calendar_event`, `delete_calendar_event`

**Roadmap rule:** for new multi-phase plans, prefer `preview` and **empty** `create_project` / `create_phase` / `create_task` on that turn; persist via **Add to workspace**.

### Safety properties

- No arbitrary tools / shell / SQL  
- Ids must come from `state`  
- Guest mode cannot mutate a personal workspace  
- Clerk JWT scopes API rows to the signed-in user  

---

## Workspace & frontend

| Route | Purpose |
| --- | --- |
| `/` | Landing → agent CTA |
| `/login`, `/sso-callback` | Clerk |
| `/dashboard` | Overview + agent drawer |
| `/agent` | Full agent + live preview panel |
| `/workspace/projects` | Roadmaps |
| `/workspace/habits` | Habits / heatmap-style loops |
| `/workspace/todos` | Todos |
| `/workspace/deadlines` | Deadlines |
| `/workspace/timeline` | Week calendar |
| `/workspace/drafts` | Lightweight notes (evolving) |

**Data layer:** `apps/web/services/api.ts` — shared `createApi` with Clerk `prepareHeaders` and tagTypes (`Habit`, `Projects`, `Todos`, …). Feature APIs inject endpoints under `features/*/`.

**UI kit:** `packages/ui` (shadcn-style shared components, agent conversation primitives, landing pieces).

---

## Backend API

**Layout:** `apps/api/src/features/<name>/`

| File | Role |
| --- | --- |
| `<name>.controllers.ts` | Handler bodies |
| `<name>.routes.ts` | Express `Router` only |

**Features:** `users`, `habits`, `todos`, `projects`, `deadlines`, `calendars`, `calendarEvents`, `timeline`, `leetcode`, `health`.

**Bootstrap:** `src/index.ts` — pino-http, CORS, JSON, Clerk middleware, mount routers, error handler.

### Route map (summary)

| Mount | Operations |
| --- | --- |
| `/syncUser`, `/userId`, `/auth-status` | Auth bootstrap / diagnostics |
| `/habits` | GET/POST, `/:id/toggle`, `/:habitId/logs`, PATCH → 501 |
| `/todos` | GET/POST/PATCH/DELETE |
| `/projects` | CRUD + `/:id/phases` + tasks + notes (nested create supported) |
| `/deadlines` | GET/POST/PATCH |
| `/calendars`, `/calendar-events` | CRUD |
| `/timeline` | Aggregated calendars + mapped events |
| `/leetcode/:username` | External GraphQL “done today?” probe |
| `/health`, `/`, `/openapi.json`, `/apidocs` | Ops / docs |

Full schemas: `apps/api/openapi.json`.

### Data model (Prisma)

`User` ← Clerk `clerkId`  
↳ `Project` → `ProjectPhase` → `ProjectTask` → `TaskLogNote`  
↳ `Habit` → `HabitLog` (journal) · completion via `completedDates[]` + `streakCount`  
↳ `Todo`, `Deadline`  
↳ `Calendar` → `CalendarEvent`

Enums include task/phase/project status, priority, habit frequency, calendar tone.

### Redis

Read-through cache on GET habits, todos, projects (list + by id), deadlines, timeline, calendars, calendar-events.

```
key examples:
  habits:user:{userId}
  projects:user:{userId}
  project:user:{userId}:{projectId}
```

**Known limitation:** no write invalidation / TTL yet — great for read-load demos; correctness requires flush or future invalidation.

### Validation & logging

- Request/response Zod (`src/zod/api.ts`) aligned with OpenAPI  
- `pino-http` request logging  
- Shared error helpers (`lib/responseErrors.ts`)  

---

## Performance (measured)

Target: production API · k6 · **20 VUs · 400 shared iterations**.

### Full CRUD smoke (pre-Redis baseline)

From `tests/performance/history/2026-11-05_smoke_20vu_400iter.md`:

| Metric | Value |
| --- | --- |
| Wall | ~8m40s |
| http_req avg / p95 | ~586ms / ~1.47s |
| Failures | ~2.33% |
| Checks | ~99.99% |

### Read-only smoke (`smokeRead.ts`) — Redis impact

Same load shape, GET-only (fair cache test):

| | No Redis | With Redis |
| --- | --- | --- |
| avg latency | ~382–430ms | ~216–225ms |
| **p95** | **~1.0–1.86s** | **~309ms** |
| throughput | ~45–51 req/s | ~86–92 req/s |
| data_received | ~258 MB | ~11–18 MB |

**Takeaway:** median often similar; **tail latency and throughput** improve. Full CRUD smoke stays write-bound (~15% avg change) — measuring the right scenario mattered.

Scripts: `tests/performance/` · docs: [`tests/performance/README.md`](./tests/performance/README.md).

---

## Monorepo layout

```
apps/
  api/                 Express + Prisma + Redis + OpenAPI
  web/                 Next.js workspace + agent
packages/
  api-contract/        OpenAPI → types / Zod exports for web
  api-types/           Shared API types
  ui/                  Shared components
  eslint-config/
  typescript-config/
tests/performance/     k6 health, smoke, smokeRead, history
.github/workflows/     deploy-api.yml → ECR → ECS
docker-compose.yml     API + Redis (local dig)
```

---

## Stack

| Layer | Choices |
| --- | --- |
| Monorepo | pnpm workspaces + Turborepo |
| Web | Next.js 16, React 19, Clerk, RTK Query, AI SDK + Groq, Tailwind |
| API | Express 5, Clerk, Prisma 7 + Neon, Redis, Zod, Swagger |
| Secrets | Doppler (`weavit-web`, `weavit-api`) |
| Deploy | API: Docker → ECR → ECS on `main` · Web: hosting separate (e.g. Vercel) |
| Tests | k6 (no Jest suite for API yet) |

---

## Getting started

### Prerequisites

Node `>= 20`, pnpm, Doppler access, Docker (optional), k6 (optional).

### Install

```bash
pnpm install
pnpm --filter api exec prisma generate
```

### Run API + Redis (Docker)

```bash
export DOPPLER_TOKEN_API=…   # Compose injects secrets into api
docker compose up
# API http://localhost:4000  · Redis localhost:6379
# If @prisma/client types missing in container:
docker compose exec api pnpm --filter api exec prisma generate
```

### Run on host

```bash
pnpm --filter api ddev    # Doppler + nodemon
pnpm --filter web ddev    # http://localhost:3000
```

### Useful root scripts

```bash
pnpm dev | ddev | build | lint | typecheck | format
```

### Regenerate contracts

```bash
pnpm --filter @weavit/api-contract generate
# Keep apps/api/src/zod/api.ts in sync with openapi.json
```

### Environment (via Doppler — not committed)

| Area | Typical secrets / config |
| --- | --- |
| API | `DATABASE_URL`, Clerk keys for Express, Redis host (Docker: `redis://redis:6379`) |
| Web | Clerk keys, `NEXT_PUBLIC_GROQ_API_KEY`, API base URL, `NEXT_PUBLIC_VERSION` |
| Compose | `DOPPLER_TOKEN_API` |

---

## Auth flow

1. Clerk sign-in on web  
2. `POST /syncUser` → Prisma user for `clerkId`  
3. RTK attaches `Authorization: Bearer <session JWT>`  
4. Controllers resolve DB `userId` via `getUserId` before CRUD  

---

## Deploy

| App | Pipeline |
| --- | --- |
| **API** | `.github/workflows/deploy-api.yml` — build `apps/api/Dockerfile`, push ECR, render `task-definition.json`, deploy ECS service |
| **Web** | Separate hosting (Clerk + Doppler + frontend platform) |

`docker-compose.yml` is **local dig** (bind mounts, nodemon). Production path is the ECS image; hardening (multi-stage, `node dist`, non-root, private Redis) is called out as follow-up work.

---

## k6 quick commands

```bash
BASE_URL=https://api.weavit.tech API_TOKEN=$JWT \
  k6 run tests/performance/smokeRead.ts

BASE_URL=https://api.weavit.tech API_TOKEN=$JWT \
  VUS=20 ITERATIONS=400 k6 run tests/performance/smoke.ts
```

Do not commit JWTs. `execution: local` = runner location, not API location.

---

## UI package

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

```tsx
import { Button } from "@workspace/ui/components/button"
```

---

## Roadmap / known gaps

- Redis TTL or invalidation on writes  
- Habit `PATCH` still 501  
- Drafts feature still light  
- Prod Docker hardening vs current dig Compose  
- Broader automated unit/integration tests beyond k6  

---

## License

Private project · see package manifests.
