import { ApiError, getApiErrorMessage } from "~/lib/api-error"

const apiBasePath = "/api"

type JsonPrimitive = string | number | boolean | null
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue }
type JsonBody = JsonValue[] | { [key: string]: JsonValue }

type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | JsonBody | null
}

export const API_ROUTES = {
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    me: "/auth/me",
  },
} as const

export async function apiFetch<T>(
  path: string,
  { body, headers: optionsHeaders, ...options }: ApiFetchOptions = {}
): Promise<T> {
  const headers = new Headers(optionsHeaders)

  if (!headers.has("Accept")) headers.set("Accept", "application/json")

  const requestBody = getRequestBody(body)
  if (requestBody.isJson && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  const response = await fetch(getApiUrl(path), {
    ...options,
    body: requestBody.body,
    headers,
  })

  const responseBody = await parseResponseBody(response)

  if (!response.ok) {
    throw new ApiError(
      getApiErrorMessage(response, responseBody),
      response,
      responseBody
    )
  }

  return responseBody as T
}

function getApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`

  return `${apiBasePath}${normalizedPath}`
}

function getRequestBody(body: ApiFetchOptions["body"]): {
  body: BodyInit | null | undefined
  isJson: boolean
} {
  if (typeof body === "undefined") return { body: undefined, isJson: false }
  if (Array.isArray(body) || isPlainObject(body)) {
    return { body: JSON.stringify(body), isJson: true }
  }

  return { body, isJson: false }
}

function isPlainObject(value: unknown): value is Record<string, JsonValue> {
  return (
    value !== null &&
    typeof value === "object" &&
    Object.getPrototypeOf(value) === Object.prototype
  )
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined

  const text = await response.text()
  if (!text) return undefined

  const contentType = response.headers.get("Content-Type")

  if (contentType?.includes("application/json")) return JSON.parse(text)

  return text
}
