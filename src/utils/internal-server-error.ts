import type { RequestHandler } from "express"

export default function internalServerError(
  res: Parameters<RequestHandler>[1],
  error?: any
) {
  return res
    .status(500)
    .json({ message: "Internal server error", error: error })
}
