import type { RequestHandler } from "express"

export default function response(
  res: Parameters<RequestHandler>[1],
  status = 200,
  message: string,
  data: any = null,
  rest: Record<string, any> = {}
) {
  if (status >= 200 && status < 400) {
    return res.status(status).json({ status, message, data, ...rest })
  } else {
    return res.status(status).json({ status, message, error: data, ...rest })
  }
}