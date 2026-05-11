import { queryOptions } from "@tanstack/react-query"

import { apiFetch, API_ROUTES } from "~/lib/api"
import { queryClient } from "~/lib/query-client"
import { useAuthStore, type AuthUser } from "~/stores/auth-store"

type LoginCredentials = {
  email: string
  password: string
}

const currentUserQueryKey = ["auth", "me"] as const

async function fetchCurrentUser(): Promise<AuthUser | null> {
  try {
    return await apiFetch<AuthUser>(API_ROUTES.auth.me)
  } catch {
    return null
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const user = await queryClient.fetchQuery(
    queryOptions({
      queryKey: currentUserQueryKey,
      queryFn: fetchCurrentUser,
      staleTime: 30_000,
    })
  )

  const authStore = useAuthStore.getState()

  if (!user) {
    authStore.clearUser()
  } else {
    authStore.setUser(user)
  }

  return Boolean(user)
}

export async function login(credentials: LoginCredentials): Promise<AuthUser> {
  const user = await apiFetch<AuthUser>(API_ROUTES.auth.login, {
    method: "POST",
    body: credentials,
  })

  queryClient.setQueryData(currentUserQueryKey, user)
  useAuthStore.getState().setUser(user)

  return user
}

export async function logout(): Promise<void> {
  await apiFetch<void>(API_ROUTES.auth.logout, {
    method: "POST",
  })

  queryClient.setQueryData(currentUserQueryKey, null)
  useAuthStore.getState().clearUser()
}

export function useAuth() {
  return useAuthStore()
}
