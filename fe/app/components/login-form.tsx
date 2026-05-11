import { useForm, type SubmitHandler } from "react-hook-form"
import { useNavigate, useSearchParams } from "react-router"

import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { login } from "~/lib/auth"
import { cn } from "~/lib/utils"

type LoginFormValues = {
  email: string
  password: string
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit: SubmitHandler<LoginFormValues> = async (values) => {
    try {
      await login(values)
      await navigate(getRedirectTo(searchParams.get("redirectTo")), {
        replace: true,
      })
    } catch {
      setError("root", {
        message: "Invalid email or password.",
      })
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field data-invalid={Boolean(errors.email)}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  aria-invalid={Boolean(errors.email)}
                  {...register("email", {
                    required: "Email is required.",
                  })}
                  required
                />
                <FieldError errors={[errors.email]} />
              </Field>
              <Field data-invalid={Boolean(errors.password)}>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                </div>
                <Input
                  id="password"
                  type="password"
                  aria-invalid={Boolean(errors.password)}
                  {...register("password", {
                    required: "Password is required.",
                  })}
                  required
                />
                <FieldError errors={[errors.password]} />
              </Field>
              <Field>
                <FieldError errors={[errors.root]} />
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Logging in..." : "Login"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function getRedirectTo(redirectTo: string | null) {
  if (
    !redirectTo ||
    !redirectTo.startsWith("/") ||
    redirectTo.startsWith("//")
  ) {
    return "/"
  }

  return redirectTo
}
