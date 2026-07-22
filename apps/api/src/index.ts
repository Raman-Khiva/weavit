import express, { Request, Response } from "express"
import { clerkMiddleware, getAuth } from "@clerk/express"
import {prisma} from '../src/config/db'
import cors from "cors"

const app = express()
const PORT = Number(process.env.PORT) || 4000

app.use(cors())
app.use(express.json())

app.use(clerkMiddleware())

app.get('/auth-status',(req:Request,res:Response)=>{
  const {isAuthenticated, userId} = getAuth(req);
  res.json({message:`user is ${isAuthenticated? "" : "not "}Authenticated`})
})

app.post('/syncUser',async (req:Request, res:Response)=>{
   try {
    console.log("Entering /syncUser")
      const {userId} = await getAuth(req);
      
      let existingUser = true;
      let user = await prisma.user.findUnique({
        where : {clerkId : userId}
      })

      if(!user){
        existingUser = false;
        user = await prisma.user.create({
          data:{
            clerkId : userId,
          }
        })
      }
      
      res.status(200).json({
        message : existingUser?"Existing user found":"New user created successfully",
        data : {
          user : user 
        }
      })
    
   } catch (error) {
     console.log("Error while syncing error",error);
     res.status(500).json({
        message: "failed to sync user",
        error : error
     })
   }
})


app.post('/db-test',async (req:Request, res:Response)=>{
    const {name} = req.body;
    
    try{
    const createTest = await prisma.test.create({
      data:{
        name
      }
    })
    res.status(201).json({
      message:"Test create successfully",
      createTest
    })
  }catch(err){
    res.status(500).json({
      message:"failed to create test",
      error: err
    })
  }

})


app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello from Express API" })
})

app.get("/health", (req: Request, res: Response) => {
  res
    .status(200)
    .json({ status: "ok", health: "100%", timestamp: new Date().toISOString() })
})

app.get("/test", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok", test: "successfull" })
})
app.get("/random", (req:Request,res:Response)=>{
  res.status(200).json({status:"ok", message:"nothing just something random"})
})

app.get("/anyend", (req:Request,res:Response)=>{
  res.status(200).json({status:"ok", message:"go back from any end"})
})

app.get("/doppler-test",(req:Request,res:Response)=>{
  res.status(200).json({status:'ok',message:`App is ${(process.env.DOPPLER==="OK")?"":"not"} getting secrets from doppler`})
})


app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`)
})
