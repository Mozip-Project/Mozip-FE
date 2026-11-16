import { ClientError } from 'graphql-request'

type ApiErrorInit = {
  code: string
  message: string
  traceId?: string
}

// 백엔드 에러 코드(GraphQL extensions.code, REST code) 보존
class ApiError extends Error {
  readonly code: string
  readonly traceId?: string

  constructor({ code, message, traceId }: ApiErrorInit) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.traceId = traceId
  }
}

function readObject(source: unknown, key: string): object | undefined {
  if (typeof source !== 'object' || source === null) {
    return undefined
  }
  const value: unknown = Reflect.get(source, key)
  return typeof value === 'object' && value !== null ? value : undefined
}

function readString(source: unknown, key: string) {
  if (typeof source !== 'object' || source === null) {
    return undefined
  }
  const value: unknown = Reflect.get(source, key)
  return typeof value === 'string' ? value : undefined
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
    })
  }

  // GraphQL 실행 전 에러는 REST 형식 본문 반환
  return parseRestError(parseJson(error.response.body)) ?? error
}

export { ApiError, parseRestError, toApiError }
