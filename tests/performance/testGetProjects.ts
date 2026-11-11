import http from "k6/http";
import { check } from "k6";

/**
 * GET /projects only — uses an existing user's Clerk session JWT.
 *
 * Required:
 *   BASE_URL=http://localhost:4000
 *   API_TOKEN=<Clerk session JWT>
 *
 * Optional:
 *   VUS=1 ITERATIONS=1
 *
 * Run:
 *   BASE_URL=http://localhost:4000 \
 *   API_TOKEN="$CLERK_SESSION_TOKEN" \
 *   k6 run tests/performance/testProjects.ts
 */

const BASE_URL = (__ENV.BASE_URL ?? "").replace(/\/+$/, "");
const API_TOKEN = __ENV.API_TOKEN;

const VUS = Number(__ENV.VUS ?? 1);
const ITERATIONS = Number(__ENV.ITERATIONS ?? 1);

if (!BASE_URL) {
  throw new Error("BASE_URL is required, e.g. http://localhost:4000");
}
if (!API_TOKEN) {
  throw new Error("API_TOKEN is required (Clerk session JWT for a registered user)");
}

export const options = {
  vus: VUS,
  iterations: ITERATIONS,
  thresholds: {
    http_req_failed: ["rate<0.01"],
    checks: ["rate>0.99"],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/projects`, {
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      Accept: "application/json",
    },
    tags: { endpoint: "/projects", name: "GET /projects" },
  });

  check(res, {
    "GET /projects → 200": (r) => r.status === 200,
    "GET /projects returns array": (r) => {
      try {
        return Array.isArray(r.json());
      } catch {
        return false;
      }
    },
  });

  if (res.status !== 200) {
    console.error(
      `[testProjects] FAIL status=${res.status} body=${String(res.body).slice(0, 400)}`,
    );
  }
}