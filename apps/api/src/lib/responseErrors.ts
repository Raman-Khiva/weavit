import type { Response } from "express"
import type { ZodError } from "zod"

function serialize(error: unknown) {
  if (error == null) return undefined
  if (error instanceof Error) return error.message
  return error
}

export function fail(
  res: Response,
  status: number,
  message: string,
  error?: unknown,
) {
  return res.status(status).json({
    message,
    ...(serialize(error) !== undefined ? { error: serialize(error) } : {}),
  })
}

export function invalidBody(res: Response, error: ZodError) {
  return fail(res, 400, "Invalid request payload", error.flatten())
}

export function invalidRes(res: Response, error: ZodError) {
  return fail(res, 500, "Response did not match OpenAPI contract", error.flatten())
}

export function invalidParamas(res : Response){
    return fail(res, 400, "Params are missing or invalid");
}

export function fromCaught(res: Response, message: string, error: unknown) {
  const isPrismaValidation =
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    error.name === "PrismaClientValidationError"

  return fail(res, isPrismaValidation ? 400 : 500, message, error)
}