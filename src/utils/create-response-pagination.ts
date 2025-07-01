import type { PaginationResponse } from "../.."

export default function createResponsePagination({
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