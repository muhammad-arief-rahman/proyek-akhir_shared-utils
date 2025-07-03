import * as jose from "jose"

export type JWTPayload = {
  sub: string
  email: string
  name: string
  role: string
  customerId?: string
  iat: number
  iss: string
  exp: number
}

export type JWT = {
  payload: JWTPayload,
  protectedHeader: jose.JWSHeaderParameters
}
