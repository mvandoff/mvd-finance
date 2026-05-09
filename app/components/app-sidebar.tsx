import * as React from "react"
import { NavLink, useLocation } from "react-router"

import { NavUser } from "~/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "~/components/ui/sidebar"
import {
  LayoutDashboardIcon,
  PiggyBankIcon,
  ReceiptIcon,
  ReceiptTextIcon,
  SettingsIcon,
  WalletIcon,
} from "lucide-react"

const data = {
  user: {
    name: "Matt",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navItems: [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Accounts",
      url: "/accounts",
      icon: WalletIcon,
    },
    {
      title: "Transactions",
      url: "/transactions",
      icon: ReceiptTextIcon,
    },
    {
      title: "Budgets",
      url: "/budgets",
      icon: PiggyBankIcon,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: SettingsIcon,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="pb-3 group-data-[collapsible=icon]:pb-4">
        <div className="flex min-w-0 items-center justify-between gap-2 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-3">
          <div className="flex h-10 min-w-0 items-center gap-3 px-2 text-sm font-medium group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
            <div className="flex size-8 items-center justify-center bg-blue-800 text-white">
              <ReceiptIcon className="size-5" />
            </div>
            <span className="truncate group-data-[collapsible=icon]:hidden">
              MVD Finance
            </span>
          </div>
          <SidebarTrigger className="shrink-0" />
        </div>
        <div className="mx-auto hidden h-px w-8 bg-sidebar-border group-data-[collapsible=icon]:block" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="px-2">
          {data.navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.url

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  render={<NavLink to={item.url} />}
                  tooltip={item.title}
                  isActive={isActive}
                >
                  <Icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="pb-4">
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
