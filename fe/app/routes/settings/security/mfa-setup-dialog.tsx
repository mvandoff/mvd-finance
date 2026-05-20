import { useState } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"

import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field"
import { Input } from "~/components/ui/input"

type MfaSetupFormValues = {
  verificationCode: string
}

/**
 * Multi-factor authentication setup dialog with the verification form shell.
 */
export function MfaSetupDialog() {
  const [open, setOpen] = useState(false)
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<MfaSetupFormValues>({
    defaultValues: {
      verificationCode: "",
    },
  })

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)

    if (!nextOpen) {
      reset()
    }
  }

  const onSubmit: SubmitHandler<MfaSetupFormValues> = (values) => {
    console.log("[mfa-setup]", values)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button type="button" variant="outline" />}>
        Enable MFA
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set up multi-factor authentication</DialogTitle>
          <DialogDescription>
            Connect an authenticator app and enter the generated code to finish
            setup.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup className="gap-4">
            <div className="mfa-setup-steps" aria-label="Setup steps">
              <div className="mfa-setup-step">
                <span className="mfa-setup-step-number">1</span>
                <p>Open your authenticator app and add a new account.</p>
              </div>
              <div className="mfa-setup-step">
                <span className="mfa-setup-step-number">2</span>
                <p>Scan the QR code or enter the setup key manually.</p>
              </div>
              <div className="mfa-setup-step">
                <span className="mfa-setup-step-number">3</span>
                <p>Enter the 6-digit code from the app.</p>
              </div>
            </div>
            <div
              className="mfa-setup-qr-placeholder"
              aria-label="QR code placeholder"
            >
              QR code placeholder
            </div>
            <div className="mfa-setup-manual-key">
              <span className="mfa-setup-manual-key-label">
                Manual setup key
              </span>
              <code className="mfa-setup-manual-key-value">
                Setup key will display here.
              </code>
            </div>
            <Field data-invalid={Boolean(errors.verificationCode)}>
              <FieldLabel htmlFor="mfa-verification-code">
                Verification code
              </FieldLabel>
              <Input
                id="mfa-verification-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                aria-invalid={Boolean(errors.verificationCode)}
                maxLength={6}
                {...register("verificationCode", {
                  required: "Verification code is required.",
                  pattern: {
                    value: /^\d{6}$/,
                    message: "Enter the 6-digit code from your app.",
                  },
                })}
              />
              <FieldError errors={[errors.verificationCode]} />
            </Field>
            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" />}>
                Cancel
              </DialogClose>
              <Button type="submit" loading={isSubmitting}>
                Verify code
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
