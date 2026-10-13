import express, { Request, response, Response } from "express"
import { clerkMiddleware, getAuth } from "@clerk/express"
import { prisma } from '../src/config/db'
import swaggerUi from "swagger-ui-express"
import openapiSpec from "../openapi.json"
import cors from "cors"
import { Habit, User } from "@prisma/client"
import {
  GetDeadlinesResponse,
  GetProjectsResponse,
  GetTodosResponse,
  PostDeadlinesBody,
  PostDeadlinesResponse,
  PostHabitsBody, PostHabitsResponse,
  PostProjectsBody,
  PostProjectsProjectIdPhasesBody,
  PostProjectsProjectIdPhasesResponse,
  PostProjectsResponse,
  PostTodosBody, PostTodosResponse,
} from "./zod/api"
import { includes, string } from "zod"
import { JsonNull } from "@prisma/client/runtime/client"

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

    // Parse through the OpenAPI response schema to enforce the contract.
    // This strips internal DB fields (e.g. description, createdAt) not
    // declared in the spec, and throws if the shape is invalid.
    const response = PostHabitsResponse.parse(postedHabit)
    res.status(201).json(response);


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





// Todos Routes


// Get Todos

app.get('/todos', async (req: Request, res: Response) => {
  try {

    const userId = await getUserId(req, res);

    if (!userId) return;

    const todos = await prisma.todo.findMany({
      where: {
        userId
      }
    });

    const result = GetTodosResponse.safeParse(todos);

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid response structure"
        , error: result.error.flatten()
      })
    }

    const validResponse = result.data;

    return res.status(200).json(validResponse)





  } catch (error) {
    return res.status(400).json({
      message: "Server error while fetching todos"
      , error: error
    })

  }
})



// Post Todo

app.post('/todos', async (req: Request, res: Response) => {
  try {
    const userId: string | null = await getUserId(req, res);

    if (!userId) {
      return res.status(400).json({
        error: "failed while finding user"
      })
    }

    const result = await PostTodosBody.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid request payload"
        , error: result.error.flatten()
      })
    }

    const validData = result.data;

    const postedTodo = await prisma.todo.create({
      data: {
        ...validData,
        userId: userId
      }
    })



    // Enforce OpenAPI contract: only declared fields are sent to the client.
    const response = PostTodosResponse.parse(postedTodo)
    res.status(201).json(response)



  }
  catch (error) {
    return res.status(400).json({
      message: "Server error while posting todo"
      , error: error
    })

  }
})




// Project Routes



// Get Projects

app.get('/projects', async (req: Request, res: Response) => {
  try {

    const userId = await getUserId(req, res);
    if (!userId) return;

    // Bug fix: was missing `await` — projects was a Promise, not an array
    const projects = await prisma.project.findMany({
      where: { userId },
      include: { phases: { include: { tasks: { include: { notes: true } } } } }
    })

    const validateRes = GetProjectsResponse.safeParse(JSON.parse(JSON.stringify(projects)));

    if (!validateRes.success) {
      return res.status(400).json({
        message: "Invalid response structure",
        error: validateRes.error.flatten()
      })
    }

    // Bug fix: was returning the safeParse wrapper {success, data} instead of the data
    return res.status(200).json(validateRes.data);

  } catch (error) {
    return res.status(400).json({
      message: "Server error while getting projects",
      error: error
    })
  }
})




// Post Projects

app.post('/projects', async (req: Request, res: Response) => {
  try {

    const userId = await getUserId(req, res);
    if (!userId) return;

    const result = PostProjectsBody.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid request payload",
        error: result.error.flatten()
      })
    }

    const validData = result.data;

    const postedProject = await prisma.project.create({
      data: {
        userId,
        ...validData
      }
    });

    const resResult = PostProjectsResponse.safeParse({
      ...postedProject,
      createdAt: postedProject.createdAt.toISOString(),
      updatedAt: postedProject.updatedAt.toISOString(),
    });

    if (!resResult.success) {
      return res.status(500).json({
        message: "Response did not match OpenAPI contract",
        error: resResult.error.flatten()
      })
    }

    return res.status(201).json(resResult.data);

  } catch (error) {
    return res.status(400).json({
      message: "Server error while posting project",
      error: error
    })
  }
})


// Phase route


// Post phase
app.post('/projects/:projectId/phases', async (req: Request, res: Response) => {
  try {

    const userId = await getUserId(req, res);
    if (!userId) return;

    const projectId = req.params.projectId;

    if ((typeof projectId !== "string") || !projectId) {
      return res.status(400).json({
        error: "Invalid project id"
      })
    }


    const result = PostProjectsProjectIdPhasesBody.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Invalid request payload",
        error: result.error.flatten()
      })
    }


    const validData = result.data;
    const postedData = await prisma.projectPhase.create({
      data: {
        projectId,
        ...validData
      }
      , include: {
        tasks:
        {
          include: { notes: true }
        }
      }



    })

    const validatePostedData = PostProjectsProjectIdPhasesResponse.safeParse(postedData);

    if (!validatePostedData.success) {
      return res.status(400).json({
        message: "Invalid response structure",
        error: validatePostedData.error.flatten()
      })
    }

    return res.status(201).json(validatePostedData.data);

  } catch (error) {

    res.status(400).json({
      message: "Server error while posting error"
      , error: error instanceof Error ? error.message : String(error)
    })

  }
})


// Deadline routes

// Post deadline

app.post('/deadlines', async (req: Request, res: Response) => {
  try {

    const userId = await getUserId(req, res);

    if (!userId) return;

    const result = PostDeadlinesBody.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid request payload",
        error: result.error.flatten()
      })
    }

    const postedData = await prisma.deadline.create({
      data: {
        userId,
        ...result.data
      }
    })

    const validatePostedData = PostDeadlinesResponse.safeParse(JSON.parse(JSON.stringify(postedData)));

    if (!validatePostedData.success) {
      return res.status(400).json({
        message: "Response didn't match openapi contract",
        error: validatePostedData.error.flatten()
      })
    }

    return res.status(201).json(validatePostedData.data);

  } catch (error) {

    return res.status(400).json({
      message: "Server error while deadline",
      error: error instanceof Error ? error.message : String(error)
    })

  }
})


// Get deadlines

app.get('/deadlines', async (req: Request, res: Response) => {
  try {

    const userId = await getUserId(req, res);

    if (!userId) return;

    const deadlines = await prisma.deadline.findMany({
      where: {
        userId
      }
    });

    const validateDeadlinesResponse = GetDeadlinesResponse.safeParse(JSON.parse(JSON.stringify(deadlines)));

    if (!validateDeadlinesResponse.success) {
      return res.status(400).json({
        message: "Response didn't match the OpenAPI contract",
        error: validateDeadlinesResponse.error.flatten()
      })
    }

    return res.status(200).json(validateDeadlinesResponse.data)


  } catch (error) {

    return res.status(400).json({
      message: "Server error while fetching deadlines",
      error: error instanceof Error ? error.message : String(error)
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
