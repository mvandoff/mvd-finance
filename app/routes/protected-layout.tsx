import { Outlet } from "react-router"

import type { Route } from "./+types/protected-layout"

const logProtectedRoute: Route.ClientMiddlewareFunction = async (
  { request },
  next,
) => {
  const url = new URL(request.url)

  console.log(`[auth] protected route middleware: ${url.pathname}`)

  await next()
}

export const clientMiddleware = [logProtectedRoute]

export default function ProtectedLayout() {
  return <Outlet />
}
