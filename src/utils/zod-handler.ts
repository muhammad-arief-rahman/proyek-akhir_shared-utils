import type { ZodError } from "zod"

export default function zodHandler(error: ZodError) {
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