import { Request, Response } from "express"

export const getRoot = (req: Request, res: Response) => {
  res.json({ message: "Hello from Express API", openapi: "/openapi.json" })
}

export const getHealth = (req: Request, res: Response) => {
  res
    .status(200)
    .json({ status: "ok", health: "100%", timestamp: new Date().toISOString() })
}

export const getTest = (req: Request, res: Response) => {
  res.status(200).json({ status: "ok", test: "successfull" })
}

export const getRandom = (req: Request, res: Response) => {
  res.status(200).json({ status: "ok", message: "nothing just something random" })
}

export const getAnyend = (req: Request, res: Response) => {
  res.status(200).json({ status: "ok", message: "go back from any end" })
}

export const getDopplerTest = (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: `App is ${(process.env.DOPPLER === "OK") ? "" : "not"} getting secrets from doppler` })
}
