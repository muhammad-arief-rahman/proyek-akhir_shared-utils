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
