import { Router } from "express"
import { getTimeline } from "./timeline.controllers"

const router = Router()

router.get('/', getTimeline)

export default router
