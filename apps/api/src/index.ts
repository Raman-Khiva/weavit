import express, { NextFunction, Request, Response } from "express"
import { clerkMiddleware } from "@clerk/express"
import swaggerUi from "swagger-ui-express"
import openapiSpec from "../openapi.json"
import cors from "cors"
import pinoHttp from "pino-http"
import { logger } from "./lib/logger.dev"
import "./config/redis"

import { getAuthStatus, syncUser, getUserIdRoute } from "./feature/users/users.routes"
import { getLeetcodeByUsername } from "./feature/leetcode/leetcode.routes"
import {
  getHabits,
  postHabits,
  postHabitsIdToggle,
  postHabitsHabitIdLogs,
  patchHabitsHabitId,
} from "./feature/habits/habits.routes"
import {
  getTodos,
  postTodos,
  patchTodosTodoId,
  deleteTodosTodoId,
} from "./feature/todos/todos.routes"
import {
  getProjects,
  getProjectsProjectId,
  patchProjectsProjectId,
  deleteProjectsProjectId,
  postProjects,
  postProjectsProjectIdPhases,
  patchProjectsProjectIdPhasesPhaseIdTasksTaskId,
  postProjectsProjectIdPhasesPhaseIdTasks,
  postProjectsProjectIdPhasesPhaseIdTasksTaskIdNotes,
} from "./feature/projects/projects.routes"
import {
  postDeadlines,
  getDeadlines,
  patchDeadlinesId,
} from "./feature/deadlines/deadlines.routes"
import { getTimeline } from "./feature/timeline/timeline.routes"
import {
  getCalendars,
  postCalendars,
  patchCalendarsId,
  deleteCalendarsId,
} from "./feature/calendars/calendars.routes"
import {
  getCalendarEvents,
  postCalendarEvents,
  patchCalendarEventsId,
  deleteCalendarEventsId,
} from "./feature/calendarEvents/calendarEvents.routes"
import {
  getRoot,
  getHealth,
  getTest,
  getRandom,
  getAnyend,
  getDopplerTest,
} from "./feature/health/health.routes"

const app = express();
const PORT = Number(process.env.PORT) || 4000


app.use(
  pinoHttp({
    logger,

    serializers: {
      req: (req) => ({
        method: req.method,
        url: req.url,
        requestId: req.id,
      }),
      res: (res) => ({
        statusCode: res.statusCode,
      }),
    },

    customSuccessMessage: (req, res) =>
      `${req.method} ${req.url} completed with ${res.statusCode}`,

    customErrorMessage: (req, res, error) =>
      `${req.method} ${req.url} failed with ${res.statusCode}: ${error.message}`,
  })
);


app.get("/openapi.json", (_req: Request, res: Response) => {
  res.json(openapiSpec)
})

app.use('/apidocs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

app.use(cors())
app.use(express.json())

app.use(clerkMiddleware())

app.get('/auth-status', getAuthStatus)

app.get("/leetcode/:username", getLeetcodeByUsername)

// HABITS
app.get("/habits", getHabits)
app.post("/habits", postHabits)
app.post("/habits/:id/toggle", postHabitsIdToggle)
app.post("/habits/:habitId/logs", postHabitsHabitIdLogs)
app.patch("/habits/:habitId", patchHabitsHabitId)

app.post('/syncUser', syncUser)

// Todos Routes
app.get('/todos', getTodos)
app.post('/todos', postTodos)
app.patch('/todos/:todoId', patchTodosTodoId)
app.delete('/todos/:todoId', deleteTodosTodoId)

// Project Routes
app.get('/projects', getProjects)
app.get('/projects/:projectId', getProjectsProjectId)
app.patch('/projects/:projectId', patchProjectsProjectId)
app.delete('/projects/:projectId', deleteProjectsProjectId)
app.post('/projects', postProjects)
app.post('/projects/:projectId/phases', postProjectsProjectIdPhases)
app.patch("/projects/:projectId/phases/:phaseId/tasks/:taskId", patchProjectsProjectIdPhasesPhaseIdTasksTaskId)
app.post("/projects/:projectId/phases/:phaseId/tasks", postProjectsProjectIdPhasesPhaseIdTasks)
app.post("/projects/:projectId/phases/:phaseId/tasks/:taskId/notes", postProjectsProjectIdPhasesPhaseIdTasksTaskIdNotes)

// Deadline routes
app.post('/deadlines', postDeadlines)
app.get('/deadlines', getDeadlines)
app.patch("/deadlines/:id", patchDeadlinesId)

// Timeline routes
app.get('/timeline', getTimeline)

app.get('/calendars', getCalendars)
app.post('/calendars', postCalendars)
app.patch('/calendars/:id', patchCalendarsId)
app.delete('/calendars/:id', deleteCalendarsId)

app.get('/calendar-events', getCalendarEvents)
app.post('/calendar-events', postCalendarEvents)
app.patch('/calendar-events/:id', patchCalendarEventsId)
app.delete('/calendar-events/:id', deleteCalendarEventsId)

app.get("/", getRoot)
app.get("/health", getHealth)
app.get("/test", getTest)
app.get("/random", getRandom)
app.get("/anyend", getAnyend)
app.get("/doppler-test", getDopplerTest)

app.get("/userId", getUserIdRoute)

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (res.headersSent) {
    logger.error({ err }, "Unhandled error after response was sent")
    return
  }
  const status =
    typeof err === "object" && err !== null && "status" in err
      ? Number((err as { status: number }).status)
      : typeof err === "object" && err !== null && "statusCode" in err
        ? Number((err as { statusCode: number }).statusCode)
        : 500
  const message =
    err instanceof Error ? err.message : "Internal Server Error"
  res.status(status).json({
    message: status < 500 ? message : "Internal Server Error",
    ...(status < 500 ? { error: message } : {}),
  })
})



app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
