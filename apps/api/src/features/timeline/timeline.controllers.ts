import { Request, Response } from "express"
import { prisma } from '../../config/db'
import {
  GetTimelineResponse,
} from "../../zod/api"
import { fromCaught, invalidRes } from "../../lib/responseErrors"
import { redis } from "../../config/redis"
import { getUserId } from "../users/users.controllers"
import { mapCalendarEvent } from "../calendars/calendars.controllers"

// Timeline routes

// Get timeline (calendars + events)
export const getTimeline = async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req, res)
    if (!userId) return

    let timelineKey = `timeline:user:${userId}`
    const cached = await redis.get(timelineKey)

    if(cached){
      return res.status(200).json(JSON.parse(cached))
    }

    const calendars = await prisma.calendar.findMany({ where: { userId } })
    const events = await prisma.calendarEvent.findMany({ where: { userId } })

    const payload = {
      calendars,
      events: events.map(mapCalendarEvent),
    }

    const validateRes = GetTimelineResponse.safeParse(JSON.parse(JSON.stringify(payload)))
    if (!validateRes.success) return invalidRes(res, validateRes.error)

    await redis.set(timelineKey,JSON.stringify(validateRes.data));

    return res.status(200).json(validateRes.data)
  } catch (error) {
    return fromCaught(res, "Server error while fetching timeline", error)
  }
}
