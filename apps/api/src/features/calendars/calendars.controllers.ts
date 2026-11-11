import { Request, Response } from "express"
import { prisma } from '../../config/db'
import {
  GetCalendarsResponse,
  PatchCalendarsIdBody,
  PatchCalendarsIdResponse,
  PostCalendarsBody,
  PostCalendarsResponse,
} from "../../zod/api"
import { fromCaught, invalidBody, invalidParamas, invalidRes } from "../../lib/responseErrors"
import { redis } from "../../config/redis"
import { getUserId } from "../users/users.controllers"

// Map DB event → API shape (calendar id field matches CalendarWeek)
export function mapCalendarEvent(ev: {
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

// Get calendars
export const getCalendars = async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req, res)
    if (!userId) return

    let calendarsKey = `calendars:user:${userId}`
    const cached = await redis.get(calendarsKey)

    if(cached){
      return res.status(200).json(JSON.parse(cached))
    }

    const calendars = await prisma.calendar.findMany({ where: { userId } })

    const validateRes = GetCalendarsResponse.safeParse(JSON.parse(JSON.stringify(calendars)))
    if (!validateRes.success) return invalidRes(res, validateRes.error)

    await redis.set(calendarsKey,JSON.stringify(validateRes.data));

    return res.status(200).json(validateRes.data)
  } catch (error) {
    return fromCaught(res, "Server error while fetching calendars", error)
  }
}

// Post calendar
export const postCalendars = async (req: Request, res: Response) => {
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
}

// Patch calendar
export const patchCalendarsId = async (req: Request<{ id: string }>, res: Response) => {
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
}

// Delete calendar
export const deleteCalendarsId = async (req: Request<{ id: string }>, res: Response) => {
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
}
