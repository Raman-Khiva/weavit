import { Router } from "express"
import {
  postDeadlines,
  getDeadlines,
  patchDeadlinesId,
} from "./deadlines.controllers"

const router = Router()

router.post('/', postDeadlines)
router.get('/', getDeadlines)
router.patch("/:id", patchDeadlinesId)

export default router
