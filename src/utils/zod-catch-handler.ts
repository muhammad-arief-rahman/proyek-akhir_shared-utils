import type { RequestHandler } from "express"
import { ZodError } from "zod"
import zodHandler from "./zod-handler"

export default function zodCatchHandler(
  error: unknown,
  res: Parameters<RequestHandler>[1],
  message = "Validation error"
) {
  if (error instanceof ZodError) {
    res.status(422).json({ message, errors: zodHandler(error) })
  }
}
