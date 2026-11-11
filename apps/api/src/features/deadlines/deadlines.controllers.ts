import { Request, Response } from "express"
import { prisma } from '../../config/db'
import {
  GetDeadlinesResponse,
  PatchDeadlinesIdBody,
  PatchDeadlinesIdParams,
  PatchDeadlinesIdResponse,
  PostDeadlinesBody,
  PostDeadlinesResponse,
} from "../../zod/api"
import { fail, fromCaught, invalidBody, invalidParamas, invalidRes } from "../../lib/responseErrors"
import { redis } from "../../config/redis"
import { getUserId } from "../users/users.controllers"

// Deadline routes

// Post deadline

export const postDeadlines = async (req: Request, res: Response) => {
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
}


// Get deadlines

export const getDeadlines = async (req: Request, res: Response) => {
  try {

    const userId = await getUserId(req, res);

    if (!userId) return;

    let deadlinesKey = `deadlines:user:${userId}`
    const cached = await redis.get(deadlinesKey)

    if(cached){
      return res.status(200).json(JSON.parse(cached))
    }

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

    await redis.set(deadlinesKey,JSON.stringify(validateDeadlinesResponse.data));

    return res.status(200).json(validateDeadlinesResponse.data)


  } catch (error) {

    return res.status(400).json({
      message: "Server error while fetching deadlines",
      error: error instanceof Error ? error.message : String(error)
    })
  }
}

// Patch deadline (completion toggle / edits)
export const patchDeadlinesId = async (req: Request<{ id: string }>, res: Response) => {
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
}
