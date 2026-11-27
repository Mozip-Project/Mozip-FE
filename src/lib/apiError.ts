import { ClientError } from 'graphql-request'

// 입력값 검증 실패(COMMON_400)의 입력별 메시지
type ApiFieldError = {
  field: string
  message: string
}

type ApiErrorInit = {
  code: string
  message: string
  traceId?: string
  fieldErrors?: ApiFieldError[]
  // 같은 코드 안에서 원인을 나누는 값(extensions.reason)
  reason?: string
}

// 백엔드 에러 코드(GraphQL extensions.code, REST code) 보존
class ApiError extends Error {
  readonly code: string
  readonly traceId?: string
  readonly fieldErrors: readonly ApiFieldError[]
  readonly reason?: string

  constructor({ code, message, traceId, fieldErrors = [], reason }: ApiErrorInit) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.traceId = traceId
    this.fieldErrors = fieldErrors
    this.reason = reason
  }
}

function readValue(source: unknown, key: string): unknown {
  if (typeof source !== 'object' || source === null) {
    return undefined
  }
  return Reflect.get(source, key)
}

function readObject(source: unknown, key: string): object | undefined {
  const value = readValue(source, key)
  return typeof value === 'object' && value !== null ? value : undefined
}

function readString(source: unknown, key: string) {
  const value = readValue(source, key)
  return typeof value === 'string' ? value : undefined
}

// GraphQL extensions.fieldErrors와 REST data가 같은 형태, 모양이 다른 항목은 제외
function parseFieldErrors(source: unknown): ApiFieldError[] {
  if (!Array.isArray(source)) {
    return []
  }
  const items: unknown[] = source

  return items.flatMap((item) => {
    const field = readString(item, 'field')
    const message = readString(item, 'message')
    return field && message ? [{ field, message }] : []
  })
}

// REST 응답 본문
function parseRestError(body: unknown) {
  const code = readString(body, 'code')
  if (!code) {
    return undefined
  }

  return new ApiError({
    code,
    message: readString(body, 'message') ?? code,
    traceId: readString(body, 'traceId'),
    fieldErrors: parseFieldErrors(readValue(body, 'data')),
  })
}

function parseJson(text: string | undefined): unknown {
  if (!text) {
    return undefined
  }
  try {
    return JSON.parse(text)
  } catch {
    return undefined
  }
}

function toApiError(error: unknown) {
  if (!(error instanceof ClientError)) {
    return error
  }

  const graphqlError: unknown = error.response.errors?.[0]
  const extensions = readObject(graphqlError, 'extensions')
  const code = readString(extensions, 'code')

  if (code) {
    return new ApiError({
      code,
      message: readString(graphqlError, 'message') ?? error.message,
      traceId: readString(extensions, 'traceId'),
      fieldErrors: parseFieldErrors(readValue(extensions, 'fieldErrors')),
      reason: readString(extensions, 'reason'),
    })
  }

  // GraphQL 실행 전 에러는 REST 형식 본문 반환
  return parseRestError(parseJson(error.response.body)) ?? error
}

export { ApiError, parseRestError, toApiError }
export type { ApiFieldError }
