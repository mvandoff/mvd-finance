import { Outlet, replace } from "react-router"

import { AppSidebar } from "~/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar"
import { isAuthenticated } from "~/features/auth/auth-session"
import type { Route } from "./+types/protected-layout"

const requireAuth: Route.ClientMiddlewareFunction = async ({ request }, next) => {
  const url = new URL(request.url)

  console.log(`[auth] protected route middleware: ${url.pathname}`)

  if (!(await isAuthenticated())) {
    const searchParams = new URLSearchParams({
      redirectTo: `${url.pathname}${url.search}`,
    })

    throw replace(`/login?${searchParams}`)
  }

  await next()
}

export const clientMiddleware = [requireAuth]

export default function ProtectedLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}
