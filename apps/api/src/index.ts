import express, { application, Request, response, Response } from "express"
import { clerkMiddleware, getAuth } from "@clerk/express"
import { prisma } from '../src/config/db'
import swaggerUi from "swagger-ui-express"
import openapiSpec from "../openapi.json"
import cors from "cors"
import { Habit, User } from "@prisma/client"
import pinoHttp from "pino-http"
import {
  GetDeadlinesResponse,
  GetHabitsResponse,
  GetProjectsResponse,
  GetTodosResponse,
  PostDeadlinesBody,
  PostDeadlinesResponse,
  PostHabitsBody, PostHabitsResponse,
  PostProjectsBody,
  PostProjectsProjectIdPhasesBody,
  PostProjectsProjectIdPhasesPhaseIdTasksBody,
  PostProjectsProjectIdPhasesPhaseIdTasksResponse,
  PostProjectsProjectIdPhasesPhaseIdTasksTaskIdNotesBody,
  PostProjectsProjectIdPhasesPhaseIdTasksTaskIdNotesResponse,
  PostProjectsProjectIdPhasesResponse,
  PostProjectsResponse,
  PostTodosBody, PostTodosResponse,
} from "./zod/api"
import { logger } from "./lib/logger.dev"
import { boolean, int, number, string } from "zod"

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



// LEETCODE Routes 

app.get("/leetcode/:username", async(req : Request, res : Response)=>{
       
  try{
    
    const {username} = req.params;
    if(!username || (typeof username != "string")){
      return res.status(500).json({
        message : "User name is required",
        error : "Invalid username"
      })
    }
    
    const recentSubmissionListQuery = `
     query recentSubmissions($username : String!){
        recentSubmissionList(username : $username, limit : 1){
           timestamp
        }
    }`; 

    const variables = {
      username : username
    };

    const response = await fetch("https://leetcode.com/graphql",{
      method : 'POST',
      headers : {
        'Content-Type' : 'application/json',
        'Accept' : 'application/json'
      }
      , body : JSON.stringify({
        query : recentSubmissionListQuery,
        variables : variables
      })
    });

    if(!response.ok){
      return res.status(response.status).json({
          message : "Failed to fetch data from leetcode",
      })
    }

    const result = await response.json();

    if(result.errors){
      return res.status(400).json({
        errors : result.errors
      })
    }

    const todayStart = new Date(); 
    todayStart.setHours(0,0,0,0);

    const recentTimestamp = Number(result.data.recentSubmissionList?.[0].timestamp) *1000;

    let doneToday : boolean= false;

    if(recentTimestamp) doneToday = recentTimestamp >= todayStart.getTime();

    return res.status(200).json({doneToday : doneToday});



  }catch(error){
    return res.status(500).json({
      message : "Internal Server Error while fetching leetcode data",
      error : error,
    })
  }
})







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

    const validateResponse = GetHabitsResponse.safeParse(JSON.parse(JSON.stringify(habits)));

    if (!validateResponse.success) {
      return res.status(500).json({
        message: "Response didn't match OpenApi contract",
        error: validateResponse.error.flatten()
      })
    }


    res.status(200).json(validateResponse.data);


  } catch (error) {

    res.status(500).json({
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

    const { logs, ...habitFields } = result.data;

    const postedHabit = await prisma.habit.create({
      data: {
        userId,
        ...habitFields,
        ...(logs?.length
          ? {
              logs: {
                create: logs.map((log) => ({
                  ...(log.completedAt ? { completedAt: new Date(log.completedAt) } : {}),
                  notes: log.notes,
                })),
              },
            }
          : {}),
      },
      include: { logs: true },
    })

    // Parse through the OpenAPI response schema to enforce the contract.
    const response = PostHabitsResponse.parse(JSON.parse(JSON.stringify(postedHabit)))
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

    if (!userId) {
      return res.status(400).json({
        message: "User is not authorized",
        error: "authentication required"
      })
    }


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

    const result = GetTodosResponse.safeParse(JSON.parse(JSON.stringify(todos)));

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
    const response = PostTodosResponse.parse(JSON.parse(JSON.stringify(postedTodo)))
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

    const { phases, ...projectFields } = result.data;

    const postedProject = await prisma.project.create({
      data: {
        userId,
        ...projectFields,
        ...(phases?.length
          ? {
              phases: {
                create: phases.map((phase) => {
                  const { tasks, ...phaseFields } = phase
                  return {
                    ...phaseFields,
                    ...(tasks?.length
                      ? {
                          tasks: {
                            create: tasks.map((task) => {
                              const { notes, ...taskFields } = task
                              return {
                                ...taskFields,
                                ...(notes?.length
                                  ? {
                                      notes: {
                                        create: notes.map((note) => ({
                                          text: note.text,
                                          author: note.author,
                                        })),
                                      },
                                    }
                                  : {}),
                              }
                            }),
                          },
                        }
                      : {}),
                  }
                }),
              },
            }
          : {}),
      },
      include: {
        phases: {
          include: {
            tasks: {
              include: { notes: true },
            },
          },
        },
      },
    });

    const resResult = PostProjectsResponse.safeParse(JSON.parse(JSON.stringify(postedProject)));

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


    const { tasks, ...phaseFields } = result.data;
    const postedData = await prisma.projectPhase.create({
      data: {
        projectId,
        ...phaseFields,
        ...(tasks?.length
          ? {
              tasks: {
                create: tasks.map((task) => {
                  const { notes, ...taskFields } = task
                  return {
                    ...taskFields,
                    ...(notes?.length
                      ? {
                          notes: {
                            create: notes.map((note) => ({
                              text: note.text,
                              author: note.author,
                            })),
                          },
                        }
                      : {}),
                  }
                }),
              },
            }
          : {}),
      },
      include: {
        tasks: {
          include: { notes: true },
        },
      },
    })

    const validatePostedData = PostProjectsProjectIdPhasesResponse.safeParse(JSON.parse(JSON.stringify(postedData)));

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





// Task routes


// Post Task Route



app.post("/projects/:projectId/phases/:phaseId/tasks", async (req: Request<{ phaseId: string }>, res: Response) => {

  try {

    const userId = await getUserId(req, res);
    if (!userId) return;


    const { phaseId } = req.params;

    if (!phaseId) {
      return res.status(500).json({
        message: "Invalid phaseId",
        error: "phaseId is required",
      })
    }

    const result = PostProjectsProjectIdPhasesPhaseIdTasksBody.safeParse(req.body);

    if (!result.success) {
      return res.status(500).json({
        message: "Invalid Request Payload",
        error: result.error.flatten()

      })
    }

    const { notes, ...taskFields } = result.data;
    const postedTask = await prisma.projectTask.create({
      data: {
        ...taskFields,
        phaseId,
        ...(notes?.length
          ? {
              notes: {
                create: notes.map((note) => ({
                  text: note.text,
                  author: note.author,
                })),
              },
            }
          : {}),
      },
      include: { notes: true },
    })

    const validatePostTaskResponse = PostProjectsProjectIdPhasesPhaseIdTasksResponse.safeParse(JSON.parse(JSON.stringify(postedTask)));

    if (!validatePostTaskResponse.success) {
      return res.status(500).json({
        message: "Invalid Response structure",
        error: validatePostTaskResponse.error.flatten()
      })
    }

    return res.status(201).json(validatePostTaskResponse.data);




  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error while posting task",
      error: error
    })
  }
})




// Notes Route

// Post Note Route

app.post("/projects/:projectId/phases/:phaseId/tasks/:taskId/notes", async (req: Request<{ taskId: string }>, res: Response) => {
  try {

    const userId = await getUserId(req, res);
    if (!userId) return;


    const { taskId } = req.params;

    if (!taskId) {
      return res.status(500).json({
        message: "Invalid taskId",
        error: "taskId is required",
      })
    }

    const result = PostProjectsProjectIdPhasesPhaseIdTasksTaskIdNotesBody.safeParse(req.body);

    if (!result.success) {
      return res.status(500).json({
        message: "Invalid Request Payload",
        error: result.error.flatten()

      })
    }

    const postedNote = await prisma.taskLogNote.create({
      data: { ...result.data, taskId }
    })

    const validatePostNoteResponse = PostProjectsProjectIdPhasesPhaseIdTasksTaskIdNotesResponse.safeParse(JSON.parse(JSON.stringify(postedNote)));

    if (!validatePostNoteResponse.success) {
      return res.status(500).json({
        message: "Invalid Response structure",
        error: validatePostNoteResponse.error.flatten()
      })
    }

    return res.status(201).json(validatePostNoteResponse.data);




  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error while posting task",
      error: error
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
})
