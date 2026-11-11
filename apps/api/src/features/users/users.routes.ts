import { Router } from "express"
import { getAuthStatus, syncUser, getUserIdRoute } from "./users.controllers"

const router = Router()

router.get('/auth-status', getAuthStatus)
router.post('/syncUser', syncUser)
router.get("/userId", getUserIdRoute)

export default router
