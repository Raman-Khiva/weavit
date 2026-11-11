import { Request, Response } from "express"
import { prisma } from '../../config/db'
import {
  DeleteTodosIdParams,
  GetTodosResponse,
  PatchTodosIdBody,
  PatchTodosIdResponse,
  PostTodosBody, PostTodosResponse,
} from "../../zod/api"
import { fromCaught, invalidBody, invalidParamas, invalidRes } from "../../lib/responseErrors"
import { redis } from "../../config/redis"
import { getUserId } from "../users/users.controllers"

// Todos Routes


// Get Todos

export const getTodos = async (req: Request, res: Response) => {
  try {

    const userId = await getUserId(req, res);

    if (!userId) return;

    let todosKey = `todos:user:${userId}`
    const cached = await redis.get(todosKey)

    if(cached){
      return res.status(200).json(JSON.parse(cached))
    }

    const todos = await prisma.todo.findMany({
      where: {
        userId
      }
    });

    const result = GetTodosResponse.safeParse(JSON.parse(JSON.stringify(todos)));

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid response structure"
        , error: result.error.flatten()
      })
    }

    const validResponse = result.data;

    await redis.set(todosKey,JSON.stringify(validResponse));

    return res.status(200).json(validResponse)





  } catch (error) {
    return res.status(400).json({
      message: "Server error while fetching todos"
      , error: error
    })

  }
}



// Post Todo

export const postTodos = async (req: Request, res: Response) => {
  try {
    const userId: string | null = await getUserId(req, res);
    if (!userId) return;

    const result = await PostTodosBody.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid request payload"
        , error: result.error.flatten()
      })
    }

    const validData = result.data;

    const postedTodo = await prisma.todo.create({
      data: {
        ...validData,
        userId: userId
      }
    })



    const response = PostTodosResponse.parse(JSON.parse(JSON.stringify(postedTodo)))
    res.status(201).json(response)



  }
  catch (error) {
    return res.status(400).json({
      message: "Server error while posting todo"
      , error: error
    })

  }
}


// patch todo

export const patchTodosTodoId = async (req : Request<{todoId : string}>, res : Response)=>{
    try{
       const userId = await getUserId(req,res);
       if(!userId){
        return 
       }

       const {todoId} = req.params;

       if(!todoId){
        return invalidParamas(res);
       }

       const validateBody = PatchTodosIdBody.safeParse(req.body);

       if(!validateBody.success){
        return invalidBody(res, validateBody.error);
       }

       const updatedTodo = await prisma.todo.update({
        where : {
          userId,
          id : todoId
        },
        data : validateBody.data
       })

       const validateRes = PatchTodosIdResponse.safeParse(JSON.parse(JSON.stringify(updatedTodo)));

       if (!validateRes.success) {
        return invalidRes(res, validateRes.error);
       }

       return res.status(200).json(validateRes.data);

    }catch(error){
      throw error
    }  

}

// delete todo
export const deleteTodosTodoId = async (req: Request<{ todoId: string }>, res: Response) => {
  try {
    const userId = await getUserId(req, res)
    if (!userId) return

    const { todoId } = req.params
    if (!todoId) return invalidParamas(res)

    const params = DeleteTodosIdParams.safeParse({ id: todoId })
    if (!params.success) return invalidParamas(res)

    await prisma.todo.delete({
      where: { id: todoId, userId },
    })

    return res.status(200).json({ message: "Todo deleted" })
  } catch (error) {
    return fromCaught(res, "Server error while deleting todo", error)
  }
}
