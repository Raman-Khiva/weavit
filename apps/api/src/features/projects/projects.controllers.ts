import { Request, Response } from "express"
import { prisma } from '../../config/db'
import {
  DeleteProjectsIdParams,
  GetProjectsIdResponse,
  GetProjectsResponse,
  PatchProjectsIdBody,
  PatchProjectsIdParams,
  PatchProjectsIdResponse,
  PatchProjectsProjectIdPhasesPhaseIdTasksTaskIdBody,
  PatchProjectsProjectIdPhasesPhaseIdTasksTaskIdResponse,
  PostProjectsBody,
  PostProjectsProjectIdPhasesBody,
  PostProjectsProjectIdPhasesPhaseIdTasksBody,
  PostProjectsProjectIdPhasesPhaseIdTasksResponse,
  PostProjectsProjectIdPhasesPhaseIdTasksTaskIdNotesBody,
  PostProjectsProjectIdPhasesPhaseIdTasksTaskIdNotesResponse,
  PostProjectsProjectIdPhasesResponse,
  PostProjectsResponse,
} from "../../zod/api"
import { fromCaught, invalidBody, invalidParamas, invalidRes } from "../../lib/responseErrors"
import { redis } from "../../config/redis"
import { getUserId } from "../users/users.controllers"

// Project Routes





// Get Projects

export const getProjects = async (req: Request, res: Response) => {
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
}



// Get Project by Id
export const getProjectsProjectId = async(req : Request<{projectId : string}>, res : Response)=>{

  try {
    const userId = await  getUserId(req,res);
    if(!userId) return;
   
    const {projectId} = req.params;

    if(!projectId){
      return invalidParamas(res);
    }

    let projectKey = `project:user:${userId}:${projectId}`
    const cached = await redis.get(projectKey)

    if(cached){
      return res.status(200).json(JSON.parse(cached))
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

    await redis.set(projectKey,JSON.stringify(validateResponse.data));

    return res.status(200).json(validateResponse.data);


  } catch (error) {
    throw error;
  }
}

// patch project (scalar fields only)
export const patchProjectsProjectId = async (req: Request<{ projectId: string }>, res: Response) => {
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
}

// delete project
export const deleteProjectsProjectId = async (req: Request<{ projectId: string }>, res: Response) => {
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
}


// Post Projects

export const postProjects = async (req: Request, res: Response) => {
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
}


// Phase route


// Post phase
export const postProjectsProjectIdPhases = async (req: Request, res: Response) => {
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
}




// Task routes



// Patch Task Routes 


export const patchProjectsProjectIdPhasesPhaseIdTasksTaskId = async (req : Request<{projectId : string, phaseId: string, taskId:string}>, res: Response)=>{
      
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
}



// Post Task Route



export const postProjectsProjectIdPhasesPhaseIdTasks = async (req: Request<{ phaseId: string }>, res: Response) => {

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
}




// Notes Route

// Post Note Route

export const postProjectsProjectIdPhasesPhaseIdTasksTaskIdNotes = async (req: Request<{ taskId: string }>, res: Response) => {
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
}
