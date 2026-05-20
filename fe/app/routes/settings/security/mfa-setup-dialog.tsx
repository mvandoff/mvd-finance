import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm, type SubmitHandler } from "react-hook-form"
import { QRCodeSVG } from "qrcode.react"

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
import { Spinner } from "~/components/ui/spinner"
import authApi from "~/features/auth/auth.api"

type MfaSetupFormValues = {
  verificationCode: string
}

const mfaSetupKeyQueryKey = ["auth", "mfaSetupKey"] as const

/**
 * Multi-factor authentication setup dialog with the verification form shell.
 */
export function MfaSetupDialog() {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const setupQuery = useQuery({
    queryKey: mfaSetupKeyQueryKey,
    queryFn: ({ signal }) => authApi.createMfaSetupKey(signal),
    enabled: open,
    gcTime: 0,
  })
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
      void queryClient.cancelQueries({ queryKey: mfaSetupKeyQueryKey })
      queryClient.removeQueries({ queryKey: mfaSetupKeyQueryKey })
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
            {setupQuery.isPending && (
              <div className="mfa-setup-loading">
                <Spinner className="mfa-setup-loading-spinner" />
              </div>
            )}
            {setupQuery.isError && (
              <p className="mfa-setup-error">
                {setupQuery.error instanceof Error
                  ? setupQuery.error.message
                  : "Sorry, something went wrong."}
              </p>
            )}
            {setupQuery.isSuccess && (
              <>
                <div
                  className="mfa-setup-qr-placeholder"
                  aria-label="QR code placeholder"
                >
                  <QRCodeSVG value={setupQuery.data.authenticatorUri} />
                </div>
                <div className="mfa-setup-manual-key">
                  <span className="mfa-setup-manual-key-label">
                    Manual setup key
                  </span>
                  <code className="mfa-setup-manual-key-value">
                    {setupQuery.data.sharedKey}
                  </code>
                </div>
              </>
            )}
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
