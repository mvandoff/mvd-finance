import type {
  ChangePasswordRequest,
  LoginRequest,
  UserSummary,
} from "~/api/contracts"
import { API_ROUTES } from "~/api/api-routes"
import { apiFetch } from "~/lib/api"

function getCurrentUser(): Promise<UserSummary> {
  return apiFetch<UserSummary>(API_ROUTES.auth.me)
}

function login(params: LoginRequest): Promise<UserSummary> {
  return apiFetch<UserSummary>(API_ROUTES.auth.login, {
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

const authApi = {
  getCurrentUser,
  login,
  logout,
  changePassword,
} as const

export default authApi
