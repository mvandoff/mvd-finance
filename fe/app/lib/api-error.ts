type ApiErrorBody = {
  error?: unknown
  message?: unknown
  title?: unknown
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly response: Response,
    public readonly body: unknown
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export function getApiErrorMessage(response: Response, body: unknown) {
  if (isApiErrorBody(body)) {
    const message = body.message ?? body.title ?? body.error

    if (typeof message === "string") {
      return message
    }
  }

  return `Request failed with status ${response.status}`
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return (
    value !== null &&
    typeof value === "object" &&
    Object.getPrototypeOf(value) === Object.prototype
  )
}
