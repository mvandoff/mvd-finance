import "./LoadingScreen.css"
import { Spinner } from "~/components/ui/spinner"

export function LoadingScreen() {
  return (
    <main className="loading-screen">
      <Spinner className="loading-screen-spinner size-8" />
    </main>
  )
}

export function NavigationLoadingIndicator() {
  return (
    <div className="navigation-loading-indicator">
      <Spinner className="navigation-loading-spinner size-8" />
    </div>
  )
}
