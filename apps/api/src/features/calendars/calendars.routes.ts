import { Router } from "express"
import {
  getCalendars,
  postCalendars,
  patchCalendarsId,
  deleteCalendarsId,
} from "./calendars.controllers"

const router = Router()

router.get('/', getCalendars)
router.post('/', postCalendars)
router.patch('/:id', patchCalendarsId)
router.delete('/:id', deleteCalendarsId)

export default router
