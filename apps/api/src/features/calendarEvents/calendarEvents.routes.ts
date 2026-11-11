import { Router } from "express"
import {
  getCalendarEvents,
  postCalendarEvents,
  patchCalendarEventsId,
  deleteCalendarEventsId,
} from "./calendarEvents.controllers"

const router = Router()

router.get('/', getCalendarEvents)
router.post('/', postCalendarEvents)
router.patch('/:id', patchCalendarEventsId)
router.delete('/:id', deleteCalendarEventsId)

export default router
