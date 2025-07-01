import type { RequestHandler } from "express"
import * as jose from "jose"
import response from "./response"

const secret = new TextEncoder().encode(process.env.JWT_SECRET as string)

export default class AuthMiddleware {
  static authenticate: (...roles: string[]) => RequestHandler = (...roles) => {
    return async (req, res, next) => {
      try {
        // Verify JWT
        const token =
          req.headers?.authorization?.split(" ")[1] || req?.cookies?.token || ""

        const user = (await jose.jwtVerify(token, secret, {
          algorithms: ["HS256"],
        })) as any

        // Check user roles
        if (roles?.length > 0 && !roles.includes(user.payload?.role)) {
          response(res, 403, "Forbidden", {
            message: "You do not have permission to access this resource",
            code: "FORBIDDEN",
          })
          return
        }

        next() // Placeholder for authentication logic
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
