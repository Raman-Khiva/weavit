import { Router } from "express"
import {
  getProjects,
  getProjectsProjectId,
  patchProjectsProjectId,
  deleteProjectsProjectId,
  postProjects,
  postProjectsProjectIdPhases,
  patchProjectsProjectIdPhasesPhaseIdTasksTaskId,
  postProjectsProjectIdPhasesPhaseIdTasks,
  postProjectsProjectIdPhasesPhaseIdTasksTaskIdNotes,
} from "./projects.controllers"

const router = Router()

router.get('/', getProjects)
router.get('/:projectId', getProjectsProjectId)
router.patch('/:projectId', patchProjectsProjectId)
router.delete('/:projectId', deleteProjectsProjectId)
router.post('/', postProjects)
router.post('/:projectId/phases', postProjectsProjectIdPhases)
router.patch("/:projectId/phases/:phaseId/tasks/:taskId", patchProjectsProjectIdPhasesPhaseIdTasksTaskId)
router.post("/:projectId/phases/:phaseId/tasks", postProjectsProjectIdPhasesPhaseIdTasks)
router.post("/:projectId/phases/:phaseId/tasks/:taskId/notes", postProjectsProjectIdPhasesPhaseIdTasksTaskIdNotes)

export default router
