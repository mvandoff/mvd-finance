import { Separator } from "~/components/ui/separator"
import { SidebarTrigger } from "~/components/ui/sidebar"

type PageHeaderProps = {
  title: string
  children?: React.ReactNode
}

/**
 * Shared header for protected app pages.
 *
 * Keeps the mobile sidebar trigger consistent while allowing each page to pass
 * page-specific actions, filters, or controls as children.
 */
export function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 px-4 transition-[width] ease-linear">
      <div className="flex min-w-0 items-center gap-2">
        {/* Opens the mobile sidebar sheet; desktop collapse lives in AppSidebar. */}
        <SidebarTrigger className="-ml-1 md:hidden" />
        <Separator
          orientation="vertical"
          className="mr-2 md:hidden data-vertical:h-4 data-vertical:self-auto"
        />
        <h1 className="truncate text-lg font-medium">{title}</h1>
      </div>
      {children ? <div className="flex items-center gap-2">{children}</div> : null}
    </header>
  )
}
