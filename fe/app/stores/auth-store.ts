import { create } from "zustand"
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware"

export type AuthUser = {
  id: string
  email: string
  name?: string | null
}

export type AuthStatus = "unknown" | "authenticated" | "unauthenticated"

type AuthStore = {
  status: AuthStatus
  user: AuthUser | null
  setUser: (user: AuthUser) => void
  clearUser: () => void
  setStatus: (status: AuthStatus) => void
}

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      status: "unknown",
      user: null,
      setUser: (user) => set({ status: "authenticated", user }),
      clearUser: () => set({ status: "unauthenticated", user: null }),
      setStatus: (status) => set({ status }),
    }),
    {
      name: "mvd-finance-auth",
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? noopStorage : window.localStorage,
      ),
      partialize: ({ status, user }) => ({ status, user }),
    },
  ),
)
