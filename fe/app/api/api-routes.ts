export const API_ROUTES = {
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    me: "/auth/me",
    changePassword: "/auth/change-password",
    createMfaSetupKey: "/auth/mfa/create-setup-key",
  },
} as const
