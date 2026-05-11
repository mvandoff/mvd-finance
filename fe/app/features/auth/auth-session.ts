import { queryOptions } from "@tanstack/react-query"

import type { LoginRequest, UserSummary } from "~/api/contracts"
import authApi from "~/features/auth/auth.api"
import { useAuthStore } from "~/features/auth/auth-store"
import { queryClient } from "~/lib/query-client"

const currentUserQueryKey = ["auth", "me"] as const

async function fetchCurrentUser(): Promise<UserSummary | null> {
  try {
    return await authApi.getCurrentUser()
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

export async function login(params: LoginRequest): Promise<UserSummary> {
  const user = await authApi.login(params)

  queryClient.setQueryData(currentUserQueryKey, user)
  useAuthStore.getState().setUser(user)

  return user
}

export async function logout(): Promise<void> {
  await authApi.logout()

  queryClient.setQueryData(currentUserQueryKey, null)
  useAuthStore.getState().clearUser()
}

export function useAuth() {
  return useAuthStore()
}
