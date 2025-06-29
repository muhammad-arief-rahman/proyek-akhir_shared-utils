// * COMMON UTILITIES ACROSS SERVICES

import type { RequestHandler } from "express"
import { ZodError } from "zod"
import * as jose from "jose"

export function internalServerError(
  res: Parameters<RequestHandler>[1],
  error?: any
) {
  return res
    .status(500)
    .json({ message: "Internal server error", error: error })
}

export function zodHandler(error: ZodError) {
  return error.errors.reduce((acc, curr) => {
    curr.path.forEach((path, index) => {
      if (!acc[path]) {
        acc[path] = []
      }

      if (index === curr.path.length - 1) {
        acc[path].push(curr.message)
      }
    })

    return acc
  }, {} as Record<string, string[]>)
}

export function zodCatchHandler(
  error: unknown,
  res: Parameters<RequestHandler>[1],
  message = "Validation error"
) {
  if (error instanceof ZodError) {
    res.status(422).json({ message, errors: zodHandler(error) })
  }
}

export function response(
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

export function createResponsePagination({
  data = [],
  page = 1,
  totalData = 1,
}: {
  totalData: number
  page: string | number
  data: any[]
}): PaginationResponse {
  return {
    currentPage: Number(page),
    totalPages: totalData,
    totalItems: data.length,
    canGoNext: Number(page) < totalData,
    canGoBack: Number(page) > 1,
    hasManyNext: Number(page) + 2 < totalData, // If the current page + 2 is less than total pages, it means there are more pages after the current page
    hasManyBack: Number(page) - 2 > 1, // If the current page - 1 is greater than 1, it means there are more pages before the current page

    // Get 2 page numbers before and after the current page and the current page itself
    pageNumbers: [
      ...Array.from({ length: 2 }, (_, i) => Math.max(1, Number(page) - 2 + i)),
      Number(page),
      ...Array.from({ length: 2 }, (_, i) =>
        Math.min(totalData, Number(page) + i + 1)
      ),
    ].filter((num, index, self) => self.indexOf(num) === index), // Remove duplicates
  }
}

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


// * TYPES
export type PaginationResponse = {
  currentPage: number
  totalPages: number
  totalItems: number
  canGoNext: boolean
  canGoBack: boolean
  hasManyNext: boolean
  hasManyBack: boolean
  pageNumbers: number[]
}

