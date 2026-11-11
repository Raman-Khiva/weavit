import express, { NextFunction, Request, Response } from "express"
import { clerkMiddleware } from "@clerk/express"
import swaggerUi from "swagger-ui-express"
import openapiSpec from "../openapi.json"
import cors from "cors"
import pinoHttp from "pino-http"
import { logger } from "./lib/logger.dev"
import "./config/redis"

import usersRoutes from "./features/users/users.routes"
import leetcodeRoutes from "./features/leetcode/leetcode.routes"
import habitsRoutes from "./features/habits/habits.routes"
import todosRoutes from "./features/todos/todos.routes"
import projectsRoutes from "./features/projects/projects.routes"
import deadlinesRoutes from "./features/deadlines/deadlines.routes"
import timelineRoutes from "./features/timeline/timeline.routes"
import calendarsRoutes from "./features/calendars/calendars.routes"
import calendarEventsRoutes from "./features/calendarEvents/calendarEvents.routes"
import healthRoutes from "./features/health/health.routes"

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

app.use(usersRoutes)
app.use("/leetcode", leetcodeRoutes)
app.use("/habits", habitsRoutes)
app.use('/todos', todosRoutes)
app.use('/projects', projectsRoutes)
app.use('/deadlines', deadlinesRoutes)
app.use('/timeline', timelineRoutes)
app.use('/calendars', calendarsRoutes)
app.use('/calendar-events', calendarEventsRoutes)
app.use(healthRoutes)

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
