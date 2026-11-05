import http from "k6/http";
import { check, group } from "k6";

/**
 * Read-only API smoke/load test generated from the Weavit OpenAPI contract.
 *
 * Required:
 *   BASE_URL=https://api.weavit.tech
 *
 * Required for protected endpoints:
 *   API_TOKEN=<Clerk session JWT>
 *
 * Required path parameters:
 *   PATH_ID=<existing project ID>
 *
 * Run:
 *   BASE_URL=https://api.weavit.tech \
 *   API_TOKEN="$CLERK_SESSION_TOKEN" \
 *   PATH_ID="$EXISTING_PROJECT_ID" \
 *   k6 run smoke.ts
 *
 * Optional load settings:
 *   VUS=5 ITERATIONS=20 k6 run smoke.ts
 */

const BASE_URL = (__ENV.BASE_URL ?? "").replace(/\/+$/, "");
const API_TOKEN = __ENV.API_TOKEN;

const VUS = Number(__ENV.VUS ?? 1);
const ITERATIONS = Number(__ENV.ITERATIONS ?? 1);

if (!BASE_URL) {
  throw new Error("BASE_URL is required, e.g. https://api.weavit.tech");
}

if (!Number.isInteger(VUS) || VUS < 1) {
  throw new Error("VUS must be a positive integer");
}

if (!Number.isInteger(ITERATIONS) || ITERATIONS < 1) {
  throw new Error("ITERATIONS must be a positive integer");
}

/**
 * This list is derived from the OpenAPI contract.
 * Only GET operations are included. No POST, PUT, PATCH, or DELETE calls.
 *
 * If the OpenAPI contract changes, update this list from the contract.
 */
const READ_ONLY_OPERATIONS = [
  {
    method: "GET",
    path: "/projects",
    operationId: "List User Projects",
    requiresAuth: true,
    pathParameters: [],
    successStatuses: [200],
  },
  {
    method: "GET",
    path: "/projects/{id}",
    operationId: "Get Project by ID",
    requiresAuth: true,
    pathParameters: ["id"],
    successStatuses: [200],
  },
  {
    method: "GET",
    path: "/habits",
    operationId: "List User Habits",
    requiresAuth: true,
    pathParameters: [],
    successStatuses: [200],
  },
  {
    method: "GET",
    path: "/todos",
    operationId: "List Todos",
    requiresAuth: true,
    pathParameters: [],
    successStatuses: [200],
  },
  {
    method: "GET",
    path: "/deadlines",
    operationId: "List Deadlines",
    requiresAuth: true,
    pathParameters: [],
    successStatuses: [200],
  },
  {
    method: "GET",
    path: "/timeline",
    operationId: "Get Timeline",
    requiresAuth: true,
    pathParameters: [],
    successStatuses: [200],
  },
  {
    method: "GET",
    path: "/calendars",
    operationId: "List Calendars",
    requiresAuth: true,
    pathParameters: [],
    successStatuses: [200],
  },
  {
    method: "GET",
    path: "/calendar-events",
    operationId: "List Calendar Events",
    requiresAuth: true,
    pathParameters: [],
    successStatuses: [200],
  },
] as const;

export const options = {
  vus: VUS,
  iterations: ITERATIONS,
  thresholds: {
    http_req_failed: ["rate<0.01"],
    checks: ["rate>0.99"],
  },
};

function resolvePath(pathTemplate: string, pathParameters: readonly string[]) {
  let resolvedPath = pathTemplate;

  for (const parameter of pathParameters) {
    const envName = `PATH_${parameter.toUpperCase()}`;
    const value = __ENV[envName];

    if (!value) {
      throw new Error(
        `${envName} is required by endpoint ${pathTemplate}`,
      );
    }

    resolvedPath = resolvedPath.replace(
      `{${parameter}}`,
      encodeURIComponent(value),
    );
  }

  return resolvedPath;
}

export default function () {
  for (const operation of READ_ONLY_OPERATIONS) {
    group(`${operation.method} ${operation.path}`, () => {
      const path = resolvePath(
        operation.path,
        operation.pathParameters,
      );

      const headers: Record<string, string> = {};

      if (operation.requiresAuth) {
        if (!API_TOKEN) {
          throw new Error(
            `API_TOKEN is required for protected endpoint ${operation.path}`,
          );
        }

        headers.Authorization = `Bearer ${API_TOKEN}`;
      }

      const response = http.request(
        operation.method,
        `${BASE_URL}${path}`,
        null,
        {
          headers,
          tags: {
            operation_id: operation.operationId,
            endpoint: operation.path,
          },
        },
      );

      check(response, {
        [`${operation.method} ${operation.path} returns success`]: (res) =>
          operation.successStatuses.includes(res.status),
      });
    });
  }
}
