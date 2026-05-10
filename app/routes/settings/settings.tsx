import { PageHeader } from "~/components/page-header"
import { SecuritySettingsCard } from "./security-settings-card"

import "./settings.css"

/**
 * Settings page with account-level navigation.
 */
export default function Page() {
  return (
    <>
      <PageHeader title="Settings" />
      <div className="settings-page">
        <AccountSettingsNav />
        <SecuritySettingsCard />
      </div>
    </>
  )
}

/**
 * Local navigation for account settings sections.
 */
function AccountSettingsNav() {
  return (
    <nav className="settings-subnav" aria-label="Account settings">
      <h2 className="settings-subnav-heading">Account</h2>
      <div className="settings-subnav-divider" />
      <div className="settings-subnav-list">
        <button
          className="settings-subnav-button settings-subnav-button-active"
          type="button"
          aria-current="page"
        >
          Security
        </button>
      </div>
    </nav>
  )
}
