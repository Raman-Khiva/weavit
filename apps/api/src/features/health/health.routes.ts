import { Router } from "express"
import {
  getRoot,
  getHealth,
  getTest,
  getRandom,
  getAnyend,
  getDopplerTest,
} from "./health.controllers"

const router = Router()

router.get("/", getRoot)
router.get("/health", getHealth)
router.get("/test", getTest)
router.get("/random", getRandom)
router.get("/anyend", getAnyend)
router.get("/doppler-test", getDopplerTest)

export default router
