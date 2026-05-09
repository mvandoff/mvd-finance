import { type RouteConfig, index, layout, route } from "@react-router/dev/routes"

export default [
  layout("routes/protected-layout.tsx", [index("routes/dashboard.tsx")]),
  route("login", "routes/login.tsx"),
] satisfies RouteConfig
