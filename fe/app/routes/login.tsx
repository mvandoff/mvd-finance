import { replace } from "react-router"
import { LoginForm } from "~/components/login-form"

import { isAuthenticated } from "~/features/auth/auth-session"
import type { Route } from "./+types/login"

const redirectIfAuthed: Route.ClientMiddlewareFunction = async (_, next) => {
  if (await isAuthenticated()) {
    throw replace(`/`)
  }

  await next()
}

export const clientMiddleware = [redirectIfAuthed]

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}
