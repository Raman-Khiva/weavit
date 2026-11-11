import { Request, Response } from "express"
import { getAuth} from "@clerk/express"
import { prisma } from '../../config/db'
import { User} from "@prisma/client" 

// GET  USERID BY CLERKID

export const getUserId = async (req: Request, res: Response): Promise<string | null> => {
  try {

    const { userId: clerkId } = await getAuth(req);

    if (!clerkId) {
      res.status(401).json({
        message: "User is not authorized",
        error: "authentication required"
      })

      return null;
    }

    const user: User | null = await prisma.user.findUnique({
      where: { clerkId }
    })


    if (!user) {
      res.status(404).json({
        error: "user not found"
      })
      return null;
    }

    const userId = user?.id

    return userId;

  }

  catch (error) {

    res.status(400).json({
      message: "error while fetching user from db",
      error: error
    })

    return null;

  }
}

export const getAuthStatus = (req: Request, res: Response) => {
  const { isAuthenticated, userId } = getAuth(req);
  res.json({ message: `user is ${isAuthenticated ? "" : "not "}Authenticated` })
}

// syncUser route
export const syncUser = async (req: Request, res: Response) => {
  try {
    console.log("Entering /syncUser")
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(400).json({
        message: "User is not authorized",
        error: "authentication required"
      })
    }


    let existingUser = true;
    let user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      existingUser = false;
      user = await prisma.user.create({
        data: {
          clerkId: userId,
        }
      })
    }

    res.status(200).json({
      message: existingUser ? "Existing user found" : "New user created successfully",
      data: {
        user: user
      }
    })

  } catch (error) {
    console.log("Error while syncing error", error);
    res.status(500).json({
      message: "failed to sync user",
      error: error
    })
  }
}

export const getUserIdRoute = (req : Request, res : Response)=>{
    const userId = getUserId(req,res);
    if(!userId) return ;
    res.status(200).json({
      userId 
    })
    
}
