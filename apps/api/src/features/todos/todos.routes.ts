import { Router } from "express"
import {
  getTodos,
  postTodos,
  patchTodosTodoId,
  deleteTodosTodoId,
} from "./todos.controllers"

const router = Router()

router.get('/', getTodos)
router.post('/', postTodos)
router.patch('/:todoId', patchTodosTodoId)
router.delete('/:todoId', deleteTodosTodoId)

export default router
