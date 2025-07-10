import type { RequestHandler } from "express"
import * as jose from "jose"
import type { JWT } from "../types"
import getAuthToken from "./get-auth-token"
import response from "./response"
import verifyJwt from "./verify-jwt"

export default class AuthMiddleware {
  static authenticate: (...roles: string[]) => RequestHandler = (...roles) => {
    return async (req, res, next) => {
      // Create a bypass if the request is from a service
      if (req.headers["x-service-secret"]) {
        const serviceSecret = process.env.SERVICE_SECRET

        if (req.headers["x-service-secret"] !== serviceSecret) {
          response(res, 403, "Forbidden", {
            error: "Invalid or missing service secret",
          })
          return
        }

        // Immediately allow the request to proceed
        req.service = {
          authenticated: true,
          id: (req.headers["x-service-id"] as string) ?? "generic-service",
          name: (req.headers["x-service-name"] as string) ?? "Generic Service",
        }

        next()
        return
      }

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
        const { email, name, sub: id, role, customerId } = jwt.payload

        req.user = {
          email,
          id,
          name,
          role,
          customerId: customerId ?? null,
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
        customerId?: string | null
      }
      service?: {
        authenticated: boolean
        name?: string
        id?: string
      }
    }
  }
}
