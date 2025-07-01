import * as jose from "jose"
import type { JWTPayload } from "../types"

const secret = new TextEncoder().encode(process.env.JWT_SECRET as string)

export default async function verifyJwt(
  token: string | null,
  errorHandling: "throw" | "return" | "null" = "throw"
) {
  if (!token) {
    return null
  }

  try {
    const jwt = await jose.jwtVerify(token, secret, {
      algorithms: ["HS256"],
    })

    return {
      payload: jwt.payload as unknown as JWTPayload,
      protectedHeader: jwt.protectedHeader,
    }
  } catch (error) {
    if (errorHandling === "throw") {
      throw error
    }

    if (errorHandling === "return") {
      return error as Error
    }

    return null
  }
}
