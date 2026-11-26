import { getApiUrl } from './apiEndpoint'
import { ApiError, parseRestError } from './apiError'

const TOKEN_EXPIRED_CODE = 'AUTH_002'
const REISSUE_ALREADY_DONE_CODE = 'AUTH_007'
const SESSION_EXPIRED_CODES = ['AUTH_004', 'AUTH_005']
const REISSUE_PATH = '/auth/reissue'
// TODO: 로그인 페이지가 생기면 로그인 경로로 변경
const SESSION_EXPIRED_REDIRECT_PATH = '/'

let pendingReissue: Promise<void> | undefined
// 재발급 성공마다 증가, 요청 뒤 이미 재발급됐는지 판단에 사용
let reissueGeneration = 0

function redirectOnSessionExpired() {
  // 이동할 화면에서 다시 만료되면 새로고침 반복 방지
  if (window.location.pathname === SESSION_EXPIRED_REDIRECT_PATH) {
    return
  }
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- React 밖 호출, 이전 계정 캐시 초기화
  window.location.assign(SESSION_EXPIRED_REDIRECT_PATH)
}

// 동시에 여러 요청이 만료돼도 재발급은 한 번만 요청
function reissueToken() {
  pendingReissue ??= (async () => {
    const response = await fetch(getApiUrl(REISSUE_PATH), {
      method: 'POST',
      credentials: 'include',
    })
    if (response.ok) {
      reissueGeneration += 1
      return
    }

    const body: unknown = await response.json().catch(() => undefined)
    const error = parseRestError(body)
    if (error?.code === REISSUE_ALREADY_DONE_CODE) {
      reissueGeneration += 1
      return
    }

    if (error && SESSION_EXPIRED_CODES.includes(error.code)) {
      redirectOnSessionExpired()
    }
    throw error ?? new Error(`토큰 재발급 실패 (HTTP ${response.status})`)
  })().finally(() => {
    pendingReissue = undefined
  })
  return pendingReissue
}

function shouldReissue(error: unknown) {
  // 서버 prefetch는 쿠키 없이 공개 조회만 하므로 브라우저에서만 재발급
  const isBrowser = typeof window !== 'undefined'
  return isBrowser && error instanceof ApiError && error.code === TOKEN_EXPIRED_CODE
}

// 액세스 토큰이 만료되면 재발급한 뒤 같은 요청을 한 번 더 보냄, GraphQL·REST 공용
async function withTokenReissue<TResult>(
  send: () => Promise<TResult>,
  toError: (error: unknown) => unknown,
): Promise<TResult> {
  const generationAtRequest = reissueGeneration

  try {
    return await send()
  } catch (error) {
    const apiError = toError(error)
    if (!shouldReissue(apiError)) {
      throw apiError
    }
  }

  // 재발급이 끝난 뒤 늦게 도착한 만료 응답은 재발급 없이 다시 요청
  if (reissueGeneration === generationAtRequest) {
    await reissueToken()
  }

  try {
    return await send()
  } catch (error) {
    throw toError(error)
  }
}

export { withTokenReissue }
