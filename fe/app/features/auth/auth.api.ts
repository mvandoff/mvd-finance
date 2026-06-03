import type {
  ChangePasswordRequest,
  LoginRequest,
  MfaSetupKeyDto,
  SetMfaEnabledRequest,
  UserSummaryDto,
} from "~/api/contracts"
import { API_ROUTES } from "~/api/api-routes"
import { apiFetch } from "~/lib/api"

function getCurrentUser(): Promise<UserSummaryDto> {
  return apiFetch<UserSummaryDto>(API_ROUTES.auth.me)
}

function login(params: LoginRequest): Promise<UserSummaryDto> {
  return apiFetch<UserSummaryDto>(API_ROUTES.auth.login, {
    method: "POST",
    body: params,
  })
}

function logout(): Promise<void> {
  return apiFetch<void>(API_ROUTES.auth.logout, {
    method: "POST",
  })
}

function changePassword(params: ChangePasswordRequest): Promise<void> {
  return apiFetch<void>(API_ROUTES.auth.changePassword, {
    method: "POST",
    body: params,
  })
}

function createMfaSetupKey(signal?: AbortSignal): Promise<MfaSetupKeyDto> {
  return apiFetch<MfaSetupKeyDto>(API_ROUTES.auth.createMfaSetupKey, {
    method: "POST",
    signal,
  })
}

function setMfaEnabled(params: SetMfaEnabledRequest): Promise<UserSummaryDto> {
  return apiFetch<UserSummaryDto>(API_ROUTES.auth.setMfaEnabled, {
    method: "POST",
    body: params,
  })
}

const authApi = {
  getCurrentUser,
  login,
  logout,
  changePassword,
  createMfaSetupKey,
  setMfaEnabled,
} as const

export default authApi
