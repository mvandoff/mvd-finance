import type {
  ChangePasswordRequest,
  LoginRequest,
  MfaSetupKeyDto,
  PostAuthLoginResponse,
  SetMfaEnabledRequest,
  UserSummaryDto,
} from "~/api/generated/types.gen"
import { API_ROUTES } from "~/api/api-routes"
import { apiFetch } from "~/lib/api"

function getCurrentUser() {
  return apiFetch<UserSummaryDto>(API_ROUTES.auth.me)
}

function login(params: LoginRequest) {
  return apiFetch<PostAuthLoginResponse>(API_ROUTES.auth.login, {
    method: "POST",
    body: params,
  })
}

function logout() {
  return apiFetch<void>(API_ROUTES.auth.logout, {
    method: "POST",
  })
}

function changePassword(params: ChangePasswordRequest) {
  return apiFetch<void>(API_ROUTES.auth.changePassword, {
    method: "POST",
    body: params,
  })
}

function createMfaSetupKey(signal?: AbortSignal) {
  return apiFetch<MfaSetupKeyDto>(API_ROUTES.auth.createMfaSetupKey, {
    method: "POST",
    signal,
  })
}

function setMfaEnabled(params: SetMfaEnabledRequest) {
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
