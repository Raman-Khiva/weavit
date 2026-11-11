import { Request, Response } from "express"
import { prisma } from '../../config/db'
import { Habit } from "@prisma/client" 
import {
  GetHabitsResponse,
  PostHabitsBody,
  PostHabitsHabitIdLogsBody,
  PostHabitsHabitIdLogsResponse,
  PostHabitsIdToggleParams,
  PostHabitsIdToggleResponse,
  PostHabitsResponse,
} from "../../zod/api"
import { fail, fromCaught, invalidBody, invalidParamas, invalidRes } from "../../lib/responseErrors"
import {
  computeStreakCount,
  toggleCompletedDate,
  utcDateString,
} from "../../lib/habitDates"
import { redis } from "../../config/redis"
import { getUserId } from "../users/users.routes"

// HABITS

// GET HABITS
export const getHabits = async (req: Request, res: Response) => {

  try {
    const userId: string | null = await getUserId(req, res);
    // getUserId already wrote 401/404 when auth fails
    if (!userId) return;

    let habitsKey = `habits:user:${userId}`
    const cached = await redis.get(habitsKey)

    if(cached){
      return res.status(200).json(JSON.parse(cached))
    }

    const habits: Habit[] = await prisma.habit.findMany({
      where: {
        userId
      },include : {logs : true}
    })

    const validateResponse = GetHabitsResponse.safeParse(JSON.parse(JSON.stringify(habits)));

    if (!validateResponse.success) {
      return invalidRes(res, validateResponse.error)
    }

    await redis.set(habitsKey,JSON.stringify(validateResponse.data));

    return res.status(200).json(validateResponse.data);


  } catch (error) {
    return fromCaught(res, "Server error while getting habits data", error)
  }
}

//POST HABIT

export const postHabits = async (req: Request, res: Response) => {
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
}

// Toggle today's completion date (source of truth: completedDates)
export const postHabitsIdToggle = async (req: Request<{ id: string }>, res: Response) => {
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
}

// Journal log only — does not update completedDates
export const postHabitsHabitIdLogs = async (req: Request<{ habitId: string }>, res: Response) => {
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
}

// patch habit

export const patchHabitsHabitId = async (_req: Request<{ habitId: string }>, res: Response) => {
  // Placeholder — not implemented yet
  return fail(res, 501, "PATCH /habits/:habitId is not implemented")
}
