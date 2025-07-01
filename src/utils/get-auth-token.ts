import type { Request } from "express"

export default function getAuthToken(req: Request, asNull: boolean = false): string | null {
  const DEFAULT_RETURN_VALUE = asNull ? null : ""
  
  try {
    if (req.headers.authorization) {
      const [type, token] = req.headers.authorization.split(" ")

      if (type !== "Bearer") {
        return DEFAULT_RETURN_VALUE
      }
      
      return token as string
    }

    if (req.cookies?.token) {
      return req.cookies.token as string
    }
    
    return DEFAULT_RETURN_VALUE
  } catch (error) {
    return DEFAULT_RETURN_VALUE
  }
}