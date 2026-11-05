import http from "k6/http";
import { check, fail, group } from "k6";

/**
 * Full API smoke: every Express route with valid payloads.
 *
 * Creates its own fixtures, exercises nested routes, then deletes what it can.
 * Does not require pre-seeded PATH_* ids (except optional LEETCODE_USERNAME).
 *
 * Required:
 *   BASE_URL=https://api.weavit.tech
 *   API_TOKEN=<Clerk session JWT>
 *
 * Optional:
 *   LEETCODE_USERNAME=neetcode   # skips GET /leetcode/:username if unset
 *   VUS=1 ITERATIONS=1
 *
 * Run:
 *   BASE_URL=https://api.weavit.tech \
 *   API_TOKEN="$CLERK_SESSION_TOKEN" \
 *   k6 run smoke.ts
 */

const BASE_URL = (__ENV.BASE_URL ?? "").replace(/\/+$/, "");
const API_TOKEN = __ENV.API_TOKEN;
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
    // CRUD smoke can hit rare races under high VUS; keep thresholds tight for default 1/1
    http_req_failed: ["rate<0.05"],
    checks: ["rate>0.95"],
  },
};

function authHeaders(extra?: Record<string, string>): Record<string, string> {
  return {
    Authorization: `Bearer ${API_TOKEN}`,
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(extra ?? {}),
  };
}

function url(path: string): string {
  return `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function parseJson(res: { json: () => unknown }): any {
  try {
    return res.json();
  } catch {
    return null;
  }
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
      `[smoke] FAIL ${name}: status=${res.status} body=${String(res.body).slice(0, 400)}`,
    );
  }
  return ok;
}

function request(
  method: string,
  path: string,
  body: unknown,
  allowed: number[],
  name?: string,
) {
  const label = name ?? `${method} ${path}`;
  const res = http.request(
    method,
    url(path),
    body === null ? null : JSON.stringify(body),
    {
      headers: authHeaders(),
      tags: { endpoint: path, name: label },
    },
  );
  assertStatus(label, res, allowed);
  return res;
}

function isoOffset(daysFromNow = 7): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysFromNow);
  return d.toISOString(); // includes offset Z — valid for zod.iso.datetime({ offset: true })
}

function ymd(daysFromNow = 0): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

function unique(prefix: string): string {
  return `${prefix} vu${__VU}-it${__ITER}-${Date.now()}`;
}

export default function () {
  // -------------------------------------------------------------------------
  // Public / diagnostic (no auth required, but fine with token)
  // -------------------------------------------------------------------------
  group("public", () => {
    assertStatus(
      "GET /",
      http.get(url("/"), { tags: { endpoint: "/" } }),
      [200],
    );
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
    assertStatus(
      "GET /test",
      http.get(url("/test"), { tags: { endpoint: "/test" } }),
      [200],
    );
    assertStatus(
      "GET /random",
      http.get(url("/random"), { tags: { endpoint: "/random" } }),
      [200],
    );
    assertStatus(
      "GET /anyend",
      http.get(url("/anyend"), { tags: { endpoint: "/anyend" } }),
      [200],
    );
    assertStatus(
      "GET /doppler-test",
      http.get(url("/doppler-test"), { tags: { endpoint: "/doppler-test" } }),
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

  // -------------------------------------------------------------------------
  // Auth bootstrap — must succeed before protected CRUD
  // -------------------------------------------------------------------------
  group("auth bootstrap", () => {
    const sync = request("POST", "/syncUser", {}, [200], "POST /syncUser");
    const syncBody = parseJson(sync);
    check(syncBody, {
      "syncUser returns user": (b) =>
        !!b && typeof b === "object" && !!(b as any).data?.user?.id,
    });

    request("GET", "/userId", null, [200], "GET /userId");
  });

  // -------------------------------------------------------------------------
  // Habits
  // -------------------------------------------------------------------------
  let habitId = "";
  group("habits", () => {
    request("GET", "/habits", null, [200], "GET /habits");

    const created = request(
      "POST",
      "/habits",
      {
        title: unique("Smoke Habit"),
        description: "k6 smoke habit",
        frequency: "DAILY",
        category: "Smoke",
      },
      [201],
      "POST /habits",
    );
    habitId = String(parseJson(created)?.id ?? "");
    if (!habitId) fail("POST /habits did not return id");

    request(
      "POST",
      `/habits/${habitId}/toggle`,
      {},
      [200],
      "POST /habits/:id/toggle",
    );

    request(
      "POST",
      `/habits/${habitId}/logs`,
      {
        notes: "Smoke journal entry",
        createdAt: isoOffset(0),
      },
      [201],
      "POST /habits/:habitId/logs",
    );

    // Not implemented — contract expects 501
    request(
      "PATCH",
      `/habits/${habitId}`,
      { title: "should-not-apply" },
      [501],
      "PATCH /habits/:habitId (501)",
    );
  });

  // -------------------------------------------------------------------------
  // Todos
  // -------------------------------------------------------------------------
  let todoId = "";
  group("todos", () => {
    request("GET", "/todos", null, [200], "GET /todos");

    const created = request(
      "POST",
      "/todos",
      {
        title: unique("Smoke Todo"),
        description: "k6 smoke todo",
        priority: "HIGH",
        dueDate: isoOffset(3),
        tags: ["smoke", "k6"],
      },
      [201],
      "POST /todos",
    );
    todoId = String(parseJson(created)?.id ?? "");
    if (!todoId) fail("POST /todos did not return id");

    request(
      "PATCH",
      `/todos/${todoId}`,
      {
        status: "IN_PROGRESS",
        priority: "URGENT",
        description: "updated by smoke",
      },
      [200],
      "PATCH /todos/:todoId",
    );
  });

  // -------------------------------------------------------------------------
  // Projects → phases → tasks → notes
  // -------------------------------------------------------------------------
  let projectId = "";
  let phaseId = "";
  let taskId = "";
  group("projects", () => {
    request("GET", "/projects", null, [200], "GET /projects");

    const created = request(
      "POST",
      "/projects",
      {
        title: unique("Smoke Project"),
        description: "Nested plan created by k6 smoke",
        category: "Smoke",
        icon: "map",
        startDate: isoOffset(0),
        endDate: isoOffset(30),
        phases: [
          {
            title: "Phase 1 — Foundations",
            description: "Seeded nested phase",
            category: "Learning",
            order: 0,
            startDate: isoOffset(0),
            endDate: isoOffset(14),
            tasks: [
              {
                title: "Seed task A",
                description: "Nested under phase 1",
                category: "Core",
                priority: "MEDIUM",
                dueDate: isoOffset(5),
                order: 0,
                notes: [
                  {
                    text: "Seed note on nested task",
                    author: "smoke",
                  },
                ],
              },
            ],
          },
        ],
      },
      [201],
      "POST /projects (nested)",
    );

    const project = parseJson(created);
    projectId = String(project?.id ?? "");
    phaseId = String(project?.phases?.[0]?.id ?? "");
    taskId = String(project?.phases?.[0]?.tasks?.[0]?.id ?? "");

    if (!projectId) fail("POST /projects did not return id");
    check(project, {
      "nested phase created": () => !!phaseId,
      "nested task created": () => !!taskId,
    });

    request(
      "GET",
      `/projects/${projectId}`,
      null,
      [200],
      "GET /projects/:projectId",
    );

    request(
      "PATCH",
      `/projects/${projectId}`,
      {
        title: unique("Smoke Project Updated"),
        description: "patched by smoke",
        status: "ACTIVE",
        category: "Smoke",
      },
      [200],
      "PATCH /projects/:projectId",
    );

    // Extra phase on the project
    const phaseRes = request(
      "POST",
      `/projects/${projectId}/phases`,
      {
        title: "Phase 2 — Smoke add",
        description: "Added via POST phases",
        category: "Build",
        order: 1,
        startDate: isoOffset(14),
        endDate: isoOffset(28),
        tasks: [
          {
            title: "Phase-2 seed task",
            priority: "LOW",
            dueDate: isoOffset(10),
          },
        ],
      },
      [201],
      "POST /projects/:projectId/phases",
    );
    const newPhaseId = String(parseJson(phaseRes)?.id ?? phaseId);
    if (newPhaseId) phaseId = newPhaseId;

    // Extra task on a phase
    const taskRes = request(
      "POST",
      `/projects/${projectId}/phases/${phaseId}/tasks`,
      {
        title: unique("Smoke Task"),
        description: "Posted onto phase",
        category: "Core",
        priority: "HIGH",
        dueDate: isoOffset(4),
        order: 1,
        notes: [{ text: "note with create", author: "smoke" }],
      },
      [201],
      "POST /projects/:projectId/phases/:phaseId/tasks",
    );
    const newTaskId = String(parseJson(taskRes)?.id ?? taskId);
    if (newTaskId) taskId = newTaskId;

    request(
      "PATCH",
      `/projects/${projectId}/phases/${phaseId}/tasks/${taskId}`,
      {
        title: "Smoke Task — in progress",
        status: "IN_PROGRESS",
      },
      [201, 200],
      "PATCH /projects/.../tasks/:taskId",
    );

    request(
      "POST",
      `/projects/${projectId}/phases/${phaseId}/tasks/${taskId}/notes`,
      {
        text: "Smoke execution note",
        author: "k6-smoke",
      },
      [201],
      "POST /projects/.../tasks/:taskId/notes",
    );
  });

  // -------------------------------------------------------------------------
  // Deadlines
  // -------------------------------------------------------------------------
  let deadlineId = "";
  group("deadlines", () => {
    request("GET", "/deadlines", null, [200], "GET /deadlines");

    const created = request(
      "POST",
      "/deadlines",
      {
        title: unique("Smoke Deadline"),
        course: "k6",
        time: "14:00",
        dueDate: isoOffset(2),
        priority: "HIGH",
      },
      [201],
      "POST /deadlines",
    );
    deadlineId = String(parseJson(created)?.id ?? "");
    if (!deadlineId) fail("POST /deadlines did not return id");

    request(
      "PATCH",
      `/deadlines/${deadlineId}`,
      {
        isCompleted: true,
        priority: "MEDIUM",
        title: unique("Smoke Deadline Done"),
      },
      [200],
      "PATCH /deadlines/:id",
    );
  });

  // -------------------------------------------------------------------------
  // Calendars + events + timeline
  // -------------------------------------------------------------------------
  let calendarId = "";
  let eventId = "";
  group("calendars + timeline", () => {
    request("GET", "/timeline", null, [200], "GET /timeline");
    request("GET", "/calendars", null, [200], "GET /calendars");
    request("GET", "/calendar-events", null, [200], "GET /calendar-events");

    const cal = request(
      "POST",
      "/calendars",
      {
        name: unique("Smoke Cal"),
        tone: "teal",
        visible: true,
      },
      [201],
      "POST /calendars",
    );
    calendarId = String(parseJson(cal)?.id ?? "");
    if (!calendarId) fail("POST /calendars did not return id");

    request(
      "PATCH",
      `/calendars/${calendarId}`,
      {
        name: unique("Smoke Cal Updated"),
        tone: "violet",
        visible: true,
      },
      [200],
      "PATCH /calendars/:id",
    );

    const ev = request(
      "POST",
      "/calendar-events",
      {
        title: unique("Smoke Event"),
        calendar: calendarId,
        date: ymd(0),
        start: 10 * 60,
        end: 11 * 60,
        allDay: false,
        location: "Zoom",
        video: true,
        people: ["smoke", "k6"],
      },
      [201],
      "POST /calendar-events",
    );
    eventId = String(parseJson(ev)?.id ?? "");
    if (!eventId) fail("POST /calendar-events did not return id");

    request(
      "PATCH",
      `/calendar-events/${eventId}`,
      {
        title: unique("Smoke Event Moved"),
        start: 11 * 60,
        end: 12 * 60,
        location: "Studio",
        video: false,
      },
      [200],
      "PATCH /calendar-events/:id",
    );

    // Re-read aggregates after writes
    request("GET", "/timeline", null, [200], "GET /timeline (after write)");
    request("GET", "/calendars", null, [200], "GET /calendars (after write)");
    request(
      "GET",
      "/calendar-events",
      null,
      [200],
      "GET /calendar-events (after write)",
    );
  });

  // -------------------------------------------------------------------------
  // Cleanup (reverse dependency order)
  // -------------------------------------------------------------------------
  group("cleanup", () => {
    if (eventId) {
      request(
        "DELETE",
        `/calendar-events/${eventId}`,
        null,
        [204, 200],
        "DELETE /calendar-events/:id",
      );
    }
    if (calendarId) {
      request(
        "DELETE",
        `/calendars/${calendarId}`,
        null,
        [204, 200],
        "DELETE /calendars/:id",
      );
    }
    if (todoId) {
      request(
        "DELETE",
        `/todos/${todoId}`,
        null,
        [200],
        "DELETE /todos/:todoId",
      );
    }
    if (projectId) {
      request(
        "DELETE",
        `/projects/${projectId}`,
        null,
        [200],
        "DELETE /projects/:projectId",
      );
    }
    // habits + deadlines have no delete routes in the API — leave seeded or ignore
  });
}
