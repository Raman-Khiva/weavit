import express, { application, NextFunction, Request, response, Response } from "express"
import { clerkMiddleware, getAuth} from "@clerk/express"
import { prisma } from '../src/config/db'
import swaggerUi from "swagger-ui-express"
import openapiSpec from "../openapi.json"
import cors from "cors"
import { Habit, User} from "@prisma/client" 
import pinoHttp from "pino-http"
import {
  DeleteProjectsIdParams,
  DeleteTodosIdParams,
  GetCalendarEventsResponse,
  GetCalendarsResponse,
  GetDeadlinesResponse,
  GetHabitsResponse,
  GetProjectsIdResponse,
  GetProjectsResponse,
  GetTimelineResponse,
  GetTodosResponse,
  PatchCalendarEventsIdBody,
  PatchCalendarEventsIdResponse,
  PatchCalendarsIdBody,
  PatchCalendarsIdResponse,
  PatchDeadlinesIdBody,
  PatchDeadlinesIdParams,
  PatchDeadlinesIdResponse,
  PatchProjectsIdBody,
  PatchProjectsIdParams,
  PatchProjectsIdResponse,
  PatchProjectsProjectIdPhasesPhaseIdTasksTaskIdBody,
  PatchProjectsProjectIdPhasesPhaseIdTasksTaskIdResponse,
  PatchTodosIdBody,
  PatchTodosIdResponse,
  PostCalendarEventsBody,
  PostCalendarEventsResponse,
  PostCalendarsBody,
  PostCalendarsResponse,
  PostDeadlinesBody,
  PostDeadlinesResponse,
  PostHabitsBody,
  PostHabitsHabitIdLogsBody,
  PostHabitsHabitIdLogsResponse,
  PostHabitsIdToggleParams,
  PostHabitsIdToggleResponse,
  PostHabitsResponse,
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
import z, { boolean, int, json, number, string } from "zod"
import { fail, fromCaught, invalidBody, invalidParamas, invalidRes } from "./lib/responseErrors"
import {
  computeStreakCount,
  toggleCompletedDate,
  utcDateString,
} from "./lib/habitDates"
import {createClient} from "redis"




// create redis client

const redis = createClient({
  url : "redis://redis:6379"
})

redis.on("error", (err) => {
  console.error("Redis error:", err);
});

redis.on("connect", () => {
  console.log("Redis connection established");
});

redis.on("ready", () => {
  console.log("Redis is ready to accept commands");
});

redis.connect();


// Map DB event → API shape (calendar id field matches CalendarWeek)
function mapCalendarEvent(ev: {
  id: string
  title: string
  calendarId: string
  date: string
  start: number
  end: number
  allDay: boolean
  days: number | null
  location: string | null
  video: boolean
  people: string[]
}) {
  return {
    id: ev.id,
    title: ev.title,
    calendar: ev.calendarId,
    date: ev.date,
    start: ev.start,
    end: ev.end,
    allDay: ev.allDay,
    days: ev.days,
    location: ev.location,
    video: ev.video,
    people: ev.people,
  }
}

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
    // getUserId already wrote 401/404 when auth fails
    if (!userId) return;

    const habits: Habit[] = await prisma.habit.findMany({
      where: {
        userId
      },include : {logs : true}
    })

    const validateResponse = GetHabitsResponse.safeParse(JSON.parse(JSON.stringify(habits)));

    if (!validateResponse.success) {
      return invalidRes(res, validateResponse.error)
    }


    return res.status(200).json(validateResponse.data);


  } catch (error) {
    return fromCaught(res, "Server error while getting habits data", error)
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

    const postedHabit = await prisma.habit.create({
      data: {
        userId,
        ...result.data,
        completedDates: [],
        streakCount: 0,
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

// Toggle today's completion date (source of truth: completedDates)
app.post("/habits/:id/toggle", async (req: Request<{ id: string }>, res: Response) => {
  try {
    const userId = await getUserId(req, res)
    if (!userId) return

    const params = PostHabitsIdToggleParams.safeParse(req.params)
    if (!params.success) {
      return invalidParamas(res)
    }

    const habit = await prisma.habit.findFirst({
      where: { id: params.data.id, userId },
      include: { logs: true },
    })
    if (!habit) {
      return fail(res, 404, "Habit not found")
    }

    const today = utcDateString()
    const completedDates = toggleCompletedDate(habit.completedDates, today)
    const streakCount = computeStreakCount(completedDates, today)

    const updated = await prisma.habit.update({
      where: { id: habit.id },
      data: { completedDates, streakCount },
      include: { logs: true },
    })

    const validateResponse = PostHabitsIdToggleResponse.safeParse(
      JSON.parse(JSON.stringify(updated))
    )
    if (!validateResponse.success) {
      return invalidRes(res, validateResponse.error)
    }

    return res.status(200).json(validateResponse.data)
  } catch (error) {
    return fromCaught(res, "Server error while toggling habit", error)
  }
})

// Journal log only — does not update completedDates
app.post("/habits/:habitId/logs", async (req: Request<{ habitId: string }>, res: Response) => {
  try {
    const userId = await getUserId(req, res)
    if (!userId) return

    const { habitId } = req.params
    if (!habitId) {
      return invalidParamas(res)
    }

    const habit = await prisma.habit.findFirst({
      where: { id: habitId, userId },
    })
    if (!habit) {
      return fail(res, 404, "Habit not found")
    }

    const validateBody = PostHabitsHabitIdLogsBody.safeParse(req.body)
    if (!validateBody.success) {
      return invalidBody(res, validateBody.error)
    }

    const postedLog = await prisma.habitLog.create({
      data: {
        habitId,
        notes: validateBody.data.notes,
        ...(validateBody.data.createdAt
          ? { createdAt: new Date(validateBody.data.createdAt) }
          : {}),
      },
    })

    const validateResponse = PostHabitsHabitIdLogsResponse.safeParse(
      JSON.parse(JSON.stringify(postedLog))
    )
    if (!validateResponse.success) {
      return invalidRes(res, validateResponse.error)
    }

    return res.status(201).json(validateResponse.data)
  } catch (error) {
    return fromCaught(res, "Internal Server Error", error)
  }
})

// patch habit

app.patch("/habits/:habitId", async (_req: Request<{ habitId: string }>, res: Response) => {
  // Placeholder — not implemented yet
  return fail(res, 501, "PATCH /habits/:habitId is not implemented")
})



// syncUser route
app.post('/syncUser', async (req: Request, res: Response) => {
  try {
    console.log("Entering /syncUser")
    const { userId } = getAuth(req);

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
    if (!userId) return;

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


// patch todo

app.patch('/todos/:todoId', async (req : Request<{todoId : string}>, res : Response)=>{
    try{
       const userId = await getUserId(req,res);
       if(!userId){
        return 
       }

       const {todoId} = req.params;

       if(!todoId){
        return invalidParamas(res);
       }

       const validateBody = PatchTodosIdBody.safeParse(req.body);

       if(!validateBody.success){
        return invalidBody(res, validateBody.error);
       }

       const updatedTodo = await prisma.todo.update({
        where : {
          userId,
          id : todoId
        },
        data : validateBody.data
       })

       const validateRes = PatchTodosIdResponse.safeParse(JSON.parse(JSON.stringify(updatedTodo)));

       if (!validateRes.success) {
        return invalidRes(res, validateRes.error);
       }

       return res.status(200).json(validateRes.data);

    }catch(error){
      throw error
    }  

})

// delete todo
app.delete('/todos/:todoId', async (req: Request<{ todoId: string }>, res: Response) => {
  try {
    const userId = await getUserId(req, res)
    if (!userId) return

    const { todoId } = req.params
    if (!todoId) return invalidParamas(res)

    const params = DeleteTodosIdParams.safeParse({ id: todoId })
    if (!params.success) return invalidParamas(res)

    await prisma.todo.delete({
      where: { id: todoId, userId },
    })

    return res.status(200).json({ message: "Todo deleted" })
  } catch (error) {
    return fromCaught(res, "Server error while deleting todo", error)
  }
})


// Project Routes





// Get Projects

app.get('/projects', async (req: Request, res: Response) => {
  try {

    const userId = await getUserId(req, res);
    if (!userId) return;

    let projectsKey = `projects:user:${userId}`
    const cached = await redis.get(projectsKey)

    if(cached){
      return res.status(200).json(JSON.parse(cached))
    }

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

    await redis.set(projectsKey,JSON.stringify(validateRes.data));

    return res.status(200).json(validateRes.data);

  } catch (error) {
    return res.status(400).json({
      message: "Server error while getting projects",
      error: error
    })
  }
})



// Get Project by Id
app.get('/projects/:projectId', async(req : Request<{projectId : string}>, res : Response)=>{

  try {
    const userId = await  getUserId(req,res);
    if(!userId) return;
   
    const {projectId} = req.params;

    if(!projectId){
      return invalidParamas(res);
    }

    const foundedProject = await prisma.project.findUnique({
      where : {
        userId,
        id : projectId
      },
      include: { phases: { include: { tasks: { include: { notes: true } } } } },
    })

    const validateResponse = GetProjectsIdResponse.safeParse(JSON.parse(JSON.stringify(foundedProject)));

    if(!validateResponse.success){
      return invalidRes(res,validateResponse.error);
    }

    return res.status(200).json(validateResponse.data);


  } catch (error) {
    throw error;
  }
})

// patch project (scalar fields only)
app.patch('/projects/:projectId', async (req: Request<{ projectId: string }>, res: Response) => {
  try {
    const userId = await getUserId(req, res)
    if (!userId) return

    const { projectId } = req.params
    if (!projectId) return invalidParamas(res)

    const params = PatchProjectsIdParams.safeParse({ id: projectId })
    if (!params.success) return invalidParamas(res)

    const body = PatchProjectsIdBody.safeParse(req.body)
    if (!body.success) return invalidBody(res, body.error)

    const { phases: _phases, ...fields } = body.data

    const updated = await prisma.project.update({
      where: { id: projectId, userId },
      data: fields,
      include: { phases: { include: { tasks: { include: { notes: true } } } } },
    })

    const validateRes = PatchProjectsIdResponse.safeParse(JSON.parse(JSON.stringify(updated)))
    if (!validateRes.success) return invalidRes(res, validateRes.error)

    return res.status(200).json(validateRes.data)
  } catch (error) {
    return fromCaught(res, "Server error while updating project", error)
  }
})

// delete project
app.delete('/projects/:projectId', async (req: Request<{ projectId: string }>, res: Response) => {
  try {
    const userId = await getUserId(req, res)
    if (!userId) return

    const { projectId } = req.params
    if (!projectId) return invalidParamas(res)

    const params = DeleteProjectsIdParams.safeParse({ id: projectId })
    if (!params.success) return invalidParamas(res)

    await prisma.project.delete({
      where: { id: projectId, userId },
    })

    return res.status(200).json({ message: "Project deleted successfully" })
  } catch (error) {
    return fromCaught(res, "Server error while deleting project", error)
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
      error: error instanceof Error ? error?.message : error
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



// Patch Task Routes 


app.patch("/projects/:projectId/phases/:phaseId/tasks/:taskId", async (req : Request<{projectId : string, phaseId: string, taskId:string}>, res: Response)=>{
      
  try {
    const userId = getUserId(req,res);
    if(!userId) return;
    
    const {projectId, phaseId,taskId} = req.params;
  
    if(!projectId || !phaseId || !taskId){
      return invalidParamas(res);
    }

    const validateBody = PatchProjectsProjectIdPhasesPhaseIdTasksTaskIdBody.safeParse(req.body);

    

    if(!validateBody.success){
      return invalidBody(res,validateBody.error);
    }

    const {note, notes, ...taskFields} = validateBody.data;
    const updatedTask = await prisma.projectTask.update({
      where:{
        id : taskId,
        phaseId,
      },
      data : taskFields,
      include : {notes : true},
    }) 

    const validateRes = PatchProjectsProjectIdPhasesPhaseIdTasksTaskIdResponse.safeParse(JSON.parse(JSON.stringify(updatedTask)));
    
    if(!validateRes.success){
      return invalidRes(res,validateRes.error);
    }

    return res.status(201).json(validateRes.data);

  } catch (error) {
    throw error;
  }
})



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

// Patch deadline (completion toggle / edits)
app.patch("/deadlines/:id", async (req: Request<{ id: string }>, res: Response) => {
  try {
    const userId = await getUserId(req, res)
    if (!userId) return

    const params = PatchDeadlinesIdParams.safeParse(req.params)
    if (!params.success) {
      return invalidParamas(res)
    }

    const body = PatchDeadlinesIdBody.safeParse(req.body)
    if (!body.success) {
      return invalidBody(res, body.error)
    }

    const existing = await prisma.deadline.findFirst({
      where: { id: params.data.id, userId },
    })
    if (!existing) {
      return fail(res, 404, "Deadline not found")
    }

    const updated = await prisma.deadline.update({
      where: { id: existing.id },
      data: body.data,
    })

    const validateResponse = PatchDeadlinesIdResponse.safeParse(
      JSON.parse(JSON.stringify(updated))
    )
    if (!validateResponse.success) {
      return invalidRes(res, validateResponse.error)
    }

    return res.status(200).json(validateResponse.data)
  } catch (error) {
    return fromCaught(res, "Server error while updating deadline", error)
  }
})

// Timeline routes

// Get timeline (calendars + events)
app.get('/timeline', async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req, res)
    if (!userId) return

    const calendars = await prisma.calendar.findMany({ where: { userId } })
    const events = await prisma.calendarEvent.findMany({ where: { userId } })

    const payload = {
      calendars,
      events: events.map(mapCalendarEvent),
    }

    const validateRes = GetTimelineResponse.safeParse(JSON.parse(JSON.stringify(payload)))
    if (!validateRes.success) return invalidRes(res, validateRes.error)

    return res.status(200).json(validateRes.data)
  } catch (error) {
    return fromCaught(res, "Server error while fetching timeline", error)
  }
})

// Get calendars
app.get('/calendars', async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req, res)
    if (!userId) return

    const calendars = await prisma.calendar.findMany({ where: { userId } })

    const validateRes = GetCalendarsResponse.safeParse(JSON.parse(JSON.stringify(calendars)))
    if (!validateRes.success) return invalidRes(res, validateRes.error)

    return res.status(200).json(validateRes.data)
  } catch (error) {
    return fromCaught(res, "Server error while fetching calendars", error)
  }
})

// Post calendar
app.post('/calendars', async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req, res)
    if (!userId) return

    const result = PostCalendarsBody.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({
        message: "Invalid request payload",
        error: result.error.flatten(),
      })
    }

    const posted = await prisma.calendar.create({
      data: {
        userId,
        ...result.data,
      },
    })

    const response = PostCalendarsResponse.parse(JSON.parse(JSON.stringify(posted)))
    return res.status(201).json(response)
  } catch (error) {
    return res.status(400).json({
      message: "failed while posting calendar",
      error,
    })
  }
})

// Patch calendar
app.patch('/calendars/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const userId = await getUserId(req, res)
    if (!userId) return

    const { id } = req.params
    if (!id) return invalidParamas(res)

    const validateBody = PatchCalendarsIdBody.safeParse(req.body)
    if (!validateBody.success) return invalidBody(res, validateBody.error)

    const updated = await prisma.calendar.update({
      where: { id, userId },
      data: validateBody.data,
    })

    const validateRes = PatchCalendarsIdResponse.safeParse(JSON.parse(JSON.stringify(updated)))
    if (!validateRes.success) return invalidRes(res, validateRes.error)

    return res.status(200).json(validateRes.data)
  } catch (error) {
    return fromCaught(res, "Server error while updating calendar", error)
  }
})

// Delete calendar
app.delete('/calendars/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const userId = await getUserId(req, res)
    if (!userId) return

    const { id } = req.params
    if (!id) return invalidParamas(res)

    await prisma.calendar.delete({
      where: { id, userId },
    })

    return res.status(204).send()
  } catch (error) {
    return fromCaught(res, "Server error while deleting calendar", error)
  }
})

// Get calendar events
app.get('/calendar-events', async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req, res)
    if (!userId) return

    const events = await prisma.calendarEvent.findMany({ where: { userId } })
    const mapped = events.map(mapCalendarEvent)

    const validateRes = GetCalendarEventsResponse.safeParse(JSON.parse(JSON.stringify(mapped)))
    if (!validateRes.success) return invalidRes(res, validateRes.error)

    return res.status(200).json(validateRes.data)
  } catch (error) {
    return fromCaught(res, "Server error while fetching calendar events", error)
  }
})

// Post calendar event
app.post('/calendar-events', async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req, res)
    if (!userId) return

    const result = PostCalendarEventsBody.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({
        message: "Invalid request payload",
        error: result.error.flatten(),
      })
    }

    const { calendar, ...fields } = result.data

    const posted = await prisma.calendarEvent.create({
      data: {
        userId,
        calendarId: calendar,
        ...fields,
      },
    })

    const response = PostCalendarEventsResponse.parse(
      JSON.parse(JSON.stringify(mapCalendarEvent(posted)))
    )
    return res.status(201).json(response)
  } catch (error) {
    return res.status(400).json({
      message: "failed while posting calendar event",
      error,
    })
  }
})

// Patch calendar event
app.patch('/calendar-events/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const userId = await getUserId(req, res)
    if (!userId) return

    const { id } = req.params
    if (!id) return invalidParamas(res)

    const validateBody = PatchCalendarEventsIdBody.safeParse(req.body)
    if (!validateBody.success) return invalidBody(res, validateBody.error)

    const { calendar, ...fields } = validateBody.data

    const updated = await prisma.calendarEvent.update({
      where: { id, userId },
      data: {
        ...fields,
        ...(calendar ? { calendarId: calendar } : {}),
      },
    })

    const validateRes = PatchCalendarEventsIdResponse.safeParse(
      JSON.parse(JSON.stringify(mapCalendarEvent(updated)))
    )
    if (!validateRes.success) return invalidRes(res, validateRes.error)

    return res.status(200).json(validateRes.data)
  } catch (error) {
    return fromCaught(res, "Server error while updating calendar event", error)
  }
})

// Delete calendar event
app.delete('/calendar-events/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const userId = await getUserId(req, res)
    if (!userId) return

    const { id } = req.params
    if (!id) return invalidParamas(res)

    await prisma.calendarEvent.delete({
      where: { id, userId },
    })

    return res.status(204).send()
  } catch (error) {
    return fromCaught(res, "Server error while deleting calendar event", error)
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

//other routes

app.get("/userId",(req : Request, res : Response)=>{
    const userId = getUserId(req,res);
    if(!userId) return ;
    res.status(200).json({
      userId 
    })
    
})

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
