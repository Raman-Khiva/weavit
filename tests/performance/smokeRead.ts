import http from "k6/http";
import { check, group } from "k6";

/**
 * Read-only API smoke — GET routes only.
 * No POST/PATCH/DELETE. No syncUser.
 *
 * Required:
 *   BASE_URL=https://api.weavit.tech
 *   API_TOKEN=<Clerk session JWT for an existing DB user>
 *
 * Optional:
 *   PROJECT_ID=<id>          # also hits GET /projects/:projectId
 *   LEETCODE_USERNAME=…      # also hits GET /leetcode/:username
 *   VUS=1 ITERATIONS=1
 *
 * Run:
 *   BASE_URL=https://api.weavit.tech \
 *   API_TOKEN="$CLERK_SESSION_TOKEN" \
 *   VUS=20 ITERATIONS=400 \
 *   k6 run tests/performance/smokeRead.ts
 */

const BASE_URL = (__ENV.BASE_URL ?? "").replace(/\/+$/, "");
const API_TOKEN = __ENV.API_TOKEN;
const PROJECT_ID = __ENV.PROJECT_ID;
const LEETCODE_USERNAME = __ENV.LEETCODE_USERNAME;

const VUS = Number(__ENV.VUS ?? 1);
const ITERATIONS = Number(__ENV.ITERATIONS ?? 1);

if (!BASE_URL) {
  throw new Error("BASE_URL is required, e.g. https://api.weavit.tech");
}
if (!API_TOKEN) {
  throw new Error("API_TOKEN is required (Clerk session JWT)");
}
if (!Number.isInteger(VUS) || VUS < 1) {
  throw new Error("VUS must be a positive integer");
}
if (!Number.isInteger(ITERATIONS) || ITERATIONS < 1) {
  throw new Error("ITERATIONS must be a positive integer");
}

export const options = {
  vus: VUS,
  iterations: ITERATIONS,
  thresholds: {
    http_req_failed: ["rate<0.05"],
    checks: ["rate>0.95"],
  },
};

function authHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${API_TOKEN}`,
    Accept: "application/json",
  };
}

function url(path: string): string {
  return `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function assertStatus(
  name: string,
  res: { status: number; body: unknown },
  allowed: number[],
): boolean {
  const ok = check(res, {
    [`${name} → ${allowed.join("|")}`]: (r) => allowed.includes(r.status),
  });
  if (!ok) {
    console.error(
      `[smokeRead] FAIL ${name}: status=${res.status} body=${String(res.body).slice(0, 400)}`,
    );
  }
  return ok;
}

function get(path: string, name?: string, allowed: number[] = [200]) {
  const label = name ?? `GET ${path}`;
  const res = http.get(url(path), {
    headers: authHeaders(),
    tags: { endpoint: path, name: label },
  });
  assertStatus(label, res, allowed);
  return res;
}

export default function () {
  group("public", () => {
    assertStatus("GET /", http.get(url("/"), { tags: { endpoint: "/" } }), [200]);
    assertStatus(
      "GET /health",
      http.get(url("/health"), { tags: { endpoint: "/health" } }),
      [200],
    );
    assertStatus(
      "GET /openapi.json",
      http.get(url("/openapi.json"), { tags: { endpoint: "/openapi.json" } }),
      [200],
    );
    assertStatus(
      "GET /auth-status",
      http.get(url("/auth-status"), {
        headers: authHeaders(),
        tags: { endpoint: "/auth-status" },
      }),
      [200],
    );

    if (LEETCODE_USERNAME) {
      assertStatus(
        `GET /leetcode/${LEETCODE_USERNAME}`,
        http.get(url(`/leetcode/${encodeURIComponent(LEETCODE_USERNAME)}`), {
          tags: { endpoint: "/leetcode/:username" },
        }),
        [200, 404, 502],
      );
    }
  });

  group("auth reads", () => {
    get("/userId", "GET /userId");
  });

  group("resource reads", () => {
    get("/habits", "GET /habits");
    get("/todos", "GET /todos");
    get("/projects", "GET /projects");

    if (PROJECT_ID) {
      get(`/projects/${PROJECT_ID}`, "GET /projects/:projectId");
    }

    get("/deadlines", "GET /deadlines");
    get("/timeline", "GET /timeline");
    get("/calendars", "GET /calendars");
    get("/calendar-events", "GET /calendar-events");
  });
}