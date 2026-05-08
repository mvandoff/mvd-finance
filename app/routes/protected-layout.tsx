import { Outlet, redirect } from "react-router"

import { isAuthenticated } from "~/lib/auth"
import type { Route } from "./+types/protected-layout"

const requireAuth: Route.ClientMiddlewareFunction = async ({ request }, next) => {
  const url = new URL(request.url)

  console.log(`[auth] protected route middleware: ${url.pathname}`)

  if (!isAuthenticated()) {
    const searchParams = new URLSearchParams({
      redirectTo: `${url.pathname}${url.search}`,
    })

    throw redirect(`/login?${searchParams}`)
  }

  await next()
}

export const clientMiddleware = [requireAuth]

export default function ProtectedLayout() {
  return <Outlet />
}
