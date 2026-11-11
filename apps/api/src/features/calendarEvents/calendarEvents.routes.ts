import { Request, Response } from "express"
import { prisma } from '../../config/db'
import {
  GetCalendarEventsResponse,
  PatchCalendarEventsIdBody,
  PatchCalendarEventsIdResponse,
  PostCalendarEventsBody,
  PostCalendarEventsResponse,
} from "../../zod/api"
import { fromCaught, invalidBody, invalidParamas, invalidRes } from "../../lib/responseErrors"
import { redis } from "../../config/redis"
import { getUserId } from "../users/users.routes"
import { mapCalendarEvent } from "../calendars/calendars.routes"

// Get calendar events
export const getCalendarEvents = async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req, res)
    if (!userId) return

    let calendarEventsKey = `calendar-events:user:${userId}`
    const cached = await redis.get(calendarEventsKey)

    if(cached){
      return res.status(200).json(JSON.parse(cached))
    }

    const events = await prisma.calendarEvent.findMany({ where: { userId } })
    const mapped = events.map(mapCalendarEvent)

    const validateRes = GetCalendarEventsResponse.safeParse(JSON.parse(JSON.stringify(mapped)))
    if (!validateRes.success) return invalidRes(res, validateRes.error)

    await redis.set(calendarEventsKey,JSON.stringify(validateRes.data));

    return res.status(200).json(validateRes.data)
  } catch (error) {
    return fromCaught(res, "Server error while fetching calendar events", error)
  }
}

// Post calendar event
export const postCalendarEvents = async (req: Request, res: Response) => {
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
}

// Patch calendar event
export const patchCalendarEventsId = async (req: Request<{ id: string }>, res: Response) => {
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
}

// Delete calendar event
export const deleteCalendarEventsId = async (req: Request<{ id: string }>, res: Response) => {
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
}
