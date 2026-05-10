import { Navigate } from "react-router"

/**
 * Redirects the settings base URL to the current default settings section.
 */
export default function SettingsRedirect() {
  return <Navigate to="/settings/security" replace />
}
