// * COMMON UTILITIES ACROSS SERVICES

import type { RequestHandler } from "express"
import { ZodError } from "zod"

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
