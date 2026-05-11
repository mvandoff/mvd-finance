import { Button } from "~/components/ui/button"
import { ChangePasswordDialog } from "./change-password-dialog"

/**
 * Security settings actions for the selected account settings section.
 */
export function SecuritySettingsCard() {
  return (
    <section
      className="settings-security-card"
      aria-labelledby="security-heading"
    >
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
        <ChangePasswordDialog />
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
