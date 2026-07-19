import express, { Request, Response } from "express"
import cors from "cors"

const app = express()
const PORT = Number(process.env.PORT) || 4000

app.use(cors())
app.use(express.json())

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

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`)
})
