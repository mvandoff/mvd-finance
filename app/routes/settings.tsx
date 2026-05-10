import { Button } from "~/components/ui/button"
import { PageHeader } from "~/components/page-header"

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

/**
 * Security settings actions for the selected account settings section.
 */
function SecuritySettingsCard() {
  return (
    <section className="settings-security-card" aria-labelledby="security-heading">
      <h2 className="settings-security-heading" id="security-heading">
        Security
      </h2>
      <div className="settings-security-divider" />
      <div className="settings-security-row">
        <div className="settings-security-row-copy">
          <h3 className="settings-security-row-heading">Password</h3>
          <p className="settings-security-row-description">
            Click the button to change your password
          </p>
        </div>
        <Button type="button" variant="outline">
          Edit password
        </Button>
      </div>
      <div className="settings-security-row">
        <div className="settings-security-row-copy">
          <h3 className="settings-security-row-heading">
            Multi-Factor Authentication
          </h3>
          <p className="settings-security-row-description">
            Protect your account with an extra security step
          </p>
        </div>
        <Button type="button" variant="outline">
          Enable MFA
        </Button>
      </div>
    </section>
  )
}
