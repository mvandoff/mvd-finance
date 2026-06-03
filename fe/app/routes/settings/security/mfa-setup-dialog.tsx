import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm, type SubmitHandler } from "react-hook-form"
import { QRCodeSVG } from "qrcode.react"
import { toast } from "sonner"

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
import { setMfaEnabled } from "~/features/auth/auth-session"
import { ApiError } from "~/lib/api-error"
import type { ValidationProblemDetails } from "~/api/contracts"

type MfaSetupFormValues = {
  verificationCode: string
}

const mfaSetupKeyQueryKey = ["auth", "mfaSetupKey"] as const

/**
 * Multi-factor authentication toggle dialog with setup details for first-time enablement.
 */
export function MfaSetupDialog({ isMfaEnabled }: { isMfaEnabled: boolean }) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const setupQuery = useQuery({
    queryKey: mfaSetupKeyQueryKey,
    queryFn: ({ signal }) => authApi.createMfaSetupKey(signal),
    enabled: open && !isMfaEnabled,
    gcTime: 0,
  })
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
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

  const onSubmit: SubmitHandler<MfaSetupFormValues> = async (values) => {
    const nextMfaEnabled = !isMfaEnabled

    try {
      await setMfaEnabled({
        enabled: nextMfaEnabled,
        code: values.verificationCode,
      })
      toast.success(
        nextMfaEnabled
          ? "Multi-factor authentication enabled."
          : "Multi-factor authentication disabled."
      )
      reset()
      setOpen(false)
    } catch (error) {
      const codeErrorMessage = getCodeValidationErrorMessage(error)

      if (codeErrorMessage) {
        setError("verificationCode", { message: codeErrorMessage })
        return
      }

      toast.error(
        error instanceof Error ? error.message : "Sorry, something went wrong."
      )
    }
  }

  const canSubmit = isMfaEnabled || setupQuery.isSuccess

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant={isMfaEnabled ? "destructive" : "outline"}
          />
        }
      >
        {isMfaEnabled ? "Disable MFA" : "Enable MFA"}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isMfaEnabled
              ? "Disable multi-factor authentication"
              : "Set up multi-factor authentication"}
          </DialogTitle>
          <DialogDescription>
            {isMfaEnabled
              ? "Enter the code from your authenticator app to disable MFA."
              : "Connect an authenticator app and enter the generated code to finish setup."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup className="gap-4">
            {!isMfaEnabled && (
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
            )}
            {!isMfaEnabled && setupQuery.isPending && (
              <div className="mfa-setup-loading">
                <Spinner className="mfa-setup-loading-spinner" />
              </div>
            )}
            {!isMfaEnabled && setupQuery.isError && (
              <p className="mfa-setup-error">
                {setupQuery.error instanceof Error
                  ? setupQuery.error.message
                  : "Sorry, something went wrong."}
              </p>
            )}
            {!isMfaEnabled && setupQuery.isSuccess && (
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
              <Button
                type="submit"
                loading={isSubmitting}
                disabled={!canSubmit}
              >
                {isMfaEnabled ? "Disable MFA" : "Verify code"}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function getCodeValidationErrorMessage(error: unknown) {
  if (!(error instanceof ApiError) || error.response.status !== 400) {
    return null
  }

  if (!isValidationProblemDetails(error.body)) {
    return null
  }

  return error.body.errors?.code?.[0] ?? null
}

function isValidationProblemDetails(
  value: unknown
): value is ValidationProblemDetails {
  return (
    value !== null &&
    typeof value === "object" &&
    Object.getPrototypeOf(value) === Object.prototype
  )
}
