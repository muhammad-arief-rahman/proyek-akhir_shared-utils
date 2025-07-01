import type { RequestHandler } from "express"
import * as jose from "jose"
import response from "./response"
import getAuthToken from "./get-auth-token"
import verifyJwt from "./verify-jwt"
import type { JWT, JWTPayload } from "../types"

const secret = new TextEncoder().encode(process.env.JWT_SECRET as string)

export default class AuthMiddleware {
  static authenticate: (...roles: string[]) => RequestHandler = (...roles) => {
    return async (req, res, next) => {
      try {
        // Verify JWT
        const token = getAuthToken(req)

        const jwt = (await verifyJwt(token, "throw")) as unknown as JWT

        // Check user roles
        if (roles?.length > 0 && !roles.includes(jwt.payload.role)) {
          response(res, 403, "Forbidden", {
            message: "You do not have permission to access this resource",
            code: "FORBIDDEN",
          })
          return
        }

        // Attach for downstream use
        const { email, name, sub: id, role } = jwt.payload

        req.user = {
          email,
          id,
          name,
          role,
        }

        next() 
      } catch (error) {
        if (error instanceof jose.errors.JWTExpired) {
          response(res, 401, "Unauthorized", {
            token: {
              message: "Token expired",
              code: "TOKEN_EXPIRED",
            },
          })
          return
        }

        if (error instanceof jose.errors.JWTClaimValidationFailed) {
          response(res, 401, "Unauthorized", {
            token: {
              message: "Invalid token claims",
              code: "INVALID_CLAIMS",
            },
          })
          return
        }

        response(res, 401, "Unauthorized", {
          token: {
            message: "Invalid or expired token",
            code: "INVALID_OR_EXPIRED",
          },
        })
      }
    }
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email: string
        name: string
        role: string
      }
    }
  }
}
