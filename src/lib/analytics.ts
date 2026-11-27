import mixpanel from 'mixpanel-browser'

type AnalyticsProperties = Record<string, string | number | boolean | null>

let isInitialized = false

// 토큰이 없으면 초기화하지 않아 이후 호출은 모두 무시
function initAnalytics() {
  const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN

  if (isInitialized || !token) {
    return
  }
  mixpanel.init(token, {
    track_pageview: 'url-with-path',
    // 위치 정보 수집 안 함
    ip: false,
    persistence: 'localStorage',
  })
  isInitialized = true
}

function track(eventName: string, properties?: AnalyticsProperties) {
  if (!isInitialized) {
    return
  }
  mixpanel.track(eventName, properties)
}

// 같은 브라우저를 여러 사람이 쓸 때 새 익명 방문자로 바꿈
function resetVisitor() {
  if (!isInitialized) {
    return
  }
  mixpanel.reset()
}

export { initAnalytics, resetVisitor, track }
export type { AnalyticsProperties }
