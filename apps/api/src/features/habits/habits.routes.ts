import { Router } from "express"
import {
  getHabits,
  postHabits,
  postHabitsIdToggle,
  postHabitsHabitIdLogs,
  patchHabitsHabitId,
} from "./habits.controllers"

const router = Router()

router.get("/", getHabits)
router.post("/", postHabits)
router.post("/:id/toggle", postHabitsIdToggle)
router.post("/:habitId/logs", postHabitsHabitIdLogs)
router.patch("/:habitId", patchHabitsHabitId)

export default router
