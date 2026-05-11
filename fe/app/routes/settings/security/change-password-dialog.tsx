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

type ChangePasswordFormValues = {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

/**
 * Change password dialog with local form validation.
 */
export function ChangePasswordDialog() {
  const [open, setOpen] = useState(false)
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<ChangePasswordFormValues>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  })

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)

    if (!nextOpen) {
      reset()
    }
  }

  const onSubmit: SubmitHandler<ChangePasswordFormValues> = () => {
    reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button type="button" variant="outline" />}>
        Edit password
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
          <DialogDescription>
            Enter your current password and choose a new one.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup className="gap-4">
            <Field data-invalid={Boolean(errors.currentPassword)}>
              <FieldLabel htmlFor="current-password">
                Current password
              </FieldLabel>
              <Input
                id="current-password"
                type="password"
                autoComplete="current-password"
                aria-invalid={Boolean(errors.currentPassword)}
                {...register("currentPassword", {
                  required: "Current password is required.",
                })}
              />
              <FieldError errors={[errors.currentPassword]} />
            </Field>
            <Field data-invalid={Boolean(errors.newPassword)}>
              <FieldLabel htmlFor="new-password">New password</FieldLabel>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.newPassword)}
                {...register("newPassword", {
                  required: "New password is required.",
                  // minLength: {
                  // value: 8,
                  // message: "New password must be at least 8 characters.",
                  // },
                })}
              />
              <FieldError errors={[errors.newPassword]} />
            </Field>
            <Field data-invalid={Boolean(errors.confirmNewPassword)}>
              <FieldLabel htmlFor="confirm-new-password">
                Confirm new password
              </FieldLabel>
              <Input
                id="confirm-new-password"
                type="password"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.confirmNewPassword)}
                {...register("confirmNewPassword", {
                  required: "Please confirm your new password.",
                  validate: (value, values) =>
                    value === values.newPassword || "New passwords must match.",
                })}
              />
              <FieldError errors={[errors.confirmNewPassword]} />
            </Field>
            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" />}>
                Cancel
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                Save password
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
