import express, { Request, Response } from "express"
import { clerkMiddleware, getAuth } from "@clerk/express"
import { prisma } from '../src/config/db'
import swaggerUi from "swagger-ui-express"
import openapiSpec from "../openapi.json"
import cors from "cors"
import { Habit, User } from "@prisma/client"
import { PostHabitsBody } from "./zod/api"

const app = express();
const PORT = Number(process.env.PORT) || 4000

app.get("/openapi.json", (_req: Request, res: Response) => {
  res.json(openapiSpec)
})

app.use('/apidocs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

app.use(cors())
app.use(express.json())

app.use(clerkMiddleware())

app.get('/auth-status', (req: Request, res: Response) => {
  const { isAuthenticated, userId } = getAuth(req);
  res.json({ message: `user is ${isAuthenticated ? "" : "not "}Authenticated` })
})


// GET  USERID BY CLERKID

const getUserId = async (req: Request, res: Response): Promise<string | null> => {
  try {

    const { userId: clerkId } = await getAuth(req);

    if (!clerkId) {
      res.status(401).json({
        message: "User is not authorized",
        error: "authentication required"
      })

      return null;
    }

    const user: User | null = await prisma.user.findUnique({
      where: { clerkId }
    })


    if (!user) {
      res.status(404).json({
        error: "user not found"
      })
      return null;
    }

    const userId = user?.id

    return userId;

  }

  catch (error) {

    res.status(400).json({
      message: "error while fetching user from db",
      error: error
    })

    return null;

  }
}







// HABITS

// GET HABITS
app.get("/habits", async (req: Request, res: Response) => {

  try {
    const userId: string | null = await getUserId(req, res);

    if (!userId) {
      return res.status(400).json({
        error: "failed while finding user"
      })

    }

    const habits: Habit[] = await prisma.habit.findMany({
      where: {
        userId
      }
    })

    res.status(200).json({
      message: "habbits data fetched successfully"
      , data: {
        habits
      }
    })


  } catch (error) {

    res.status(400).json({
      message: "Server error while getting habits data",
      error: error
    })

  }
})

//POST HABIT

app.post("/habits", async (req: Request, res: Response) => {
  try {

    const userId: string | null = await getUserId(req, res);
    if (!userId) return;

    const result = PostHabitsBody.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid request payload",
        error: result.error.flatten()
      })
    }

    const validData = result.data;


    const postedHabit = await prisma.habit.create({
      data: {
        userId,
        ...validData
      }

    })

    res.status(200).json({
      message: "Habit posted successfully",
      postedHabit,
    })


  } catch (error) {

    res.status(400).json({
      message: "failed while posting habit"
      , error: error
    })

  }
})


app.post('/syncUser', async (req: Request, res: Response) => {
  try {
    console.log("Entering /syncUser")
    const { userId } = await getAuth(req);

    let existingUser = true;
    let user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      existingUser = false;
      user = await prisma.user.create({
        data: {
          clerkId: userId,
        }
      })
    }

    res.status(200).json({
      message: existingUser ? "Existing user found" : "New user created successfully",
      data: {
        user: user
      }
    })

  } catch (error) {
    console.log("Error while syncing error", error);
    res.status(500).json({
      message: "failed to sync user",
      error: error
    })
  }
})


app.post('/db-test', async (req: Request, res: Response) => {
  const { name } = req.body;

  try {
    const createTest = await prisma.test.create({
      data: {
        name
      }
    })
    res.status(201).json({
      message: "Test create successfully",
      createTest
    })
  } catch (err) {
    res.status(500).json({
      message: "failed to create test",
      error: err
    })
  }

})


app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello from Express API", openapi: "/openapi.json" })
})

app.get("/health", (req: Request, res: Response) => {
  res
    .status(200)
    .json({ status: "ok", health: "100%", timestamp: new Date().toISOString() })
})

app.get("/test", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok", test: "successfull" })
})
app.get("/random", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok", message: "nothing just something random" })
})

app.get("/anyend", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok", message: "go back from any end" })
})

app.get("/doppler-test", (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: `App is ${(process.env.DOPPLER === "OK") ? "" : "not"} getting secrets from doppler` })
})


app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`)
  console.log(`DATABASE_URL  ${process.env.DATABASE_URL}`)
})
