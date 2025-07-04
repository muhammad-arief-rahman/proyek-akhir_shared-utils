// * COMMON UTILITIES ACROSS SERVICES
export {
  AuthMiddleware,
  createResponsePagination,
  internalServerError,
  response,
  zodCatchHandler,
  zodHandler,
  getAuthToken,
  verifyJwt,

  // Media utilities
  getMulterFile,
  getMulterFiles,
  storeMedia,
  deleteMedia,
} from "./src/utils"

// * Configs
export { INTERNAL_SERVICES } from "./src/config"

// * Types
export type {
  PaginationResponse,
  JWTPayload,
  APIError,
  APIResponse,
} from "./src/types"
