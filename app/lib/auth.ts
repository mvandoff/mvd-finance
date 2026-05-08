import { queryOptions } from "@tanstack/react-query"

import { apiFetch, API_ROUTES } from "~/lib/api"
import { queryClient } from "~/lib/query-client"
import { useAuthStore } from "~/stores/auth-store"

const authStatusQueryKey = ["auth", "status"] as const

async function fetchAuthStatus(): Promise<boolean> {
  try {
    return await apiFetch<boolean>(API_ROUTES.auth.status)
  } catch {
    return false
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const authenticated = await queryClient.fetchQuery(
    queryOptions({
      queryKey: authStatusQueryKey,
      queryFn: fetchAuthStatus,
      staleTime: 30_000,
    })
  )

  const authStore = useAuthStore.getState()

  if (!authenticated) {
    authStore.clearUser()
  } else {
    authStore.setStatus("authenticated")
  }

  return authenticated
}

export function useAuth() {
  return useAuthStore()
}
