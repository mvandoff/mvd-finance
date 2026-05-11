// API contract types should mirror backend request/response models; this file can be replaced by generation later.
export type UserSummaryDto = {
  email: string
  name: string
}

export type LoginRequest = {
  email: string
  password: string
}

export type ChangePasswordRequest = {
  currentPassword: string
  newPassword: string
}
