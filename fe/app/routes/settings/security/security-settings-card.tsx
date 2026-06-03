import { ChangePasswordDialog } from "./change-password-dialog"
import { MfaSetupDialog } from "./mfa-setup-dialog"
import { useAuth } from "~/features/auth/auth-session"

/**
 * Security settings actions for the selected account settings section.
 */
export function SecuritySettingsCard() {
  const { user } = useAuth()
  const isMfaEnabled = Boolean(user?.isMfaEnabled)

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
            {isMfaEnabled
              ? "MFA is enabled for your account"
              : "Protect your account with an extra security step"}
          </p>
        </div>
        <MfaSetupDialog isMfaEnabled={isMfaEnabled} />
      </div>
    </section>
  )
}
