import { Router } from "express"
import { getLeetcodeByUsername } from "./leetcode.controllers"

const router = Router()

router.get("/:username", getLeetcodeByUsername)

export default router
