import { useAuthStore } from "~/stores/auth-store"

export function isAuthenticated() {
  return false
}

export function useAuth() {
  return useAuthStore()
}
