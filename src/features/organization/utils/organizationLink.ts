// Figma 공고 상세 기준 도메인별 링크 이름, 그 외는 '웹사이트'
const LINK_LABEL_BY_DOMAIN = [
  { domain: 'instagram.com', label: '인스타그램' },
  { domain: 'youtube.com', label: '유튜브' },
  { domain: 'notion.site', label: '노션' },
] as const

const DEFAULT_LINK_LABEL = '웹사이트'

function getHostname(url: string) {
  try {
    return new URL(url).hostname
  } catch {
    return null
  }
}

function getOrganizationLinkLabel(url: string) {
  const hostname = getHostname(url)

  if (!hostname) {
    return DEFAULT_LINK_LABEL
  }

  const matched = LINK_LABEL_BY_DOMAIN.find(
    ({ domain }) => hostname === domain || hostname.endsWith(`.${domain}`),
  )

  return matched?.label ?? DEFAULT_LINK_LABEL
}

// 단체 설정 입력이 주소 형식을 강제하지 않아 http(s) 주소일 때만 링크로 사용
function isHttpUrl(url: string) {
  try {
    const { protocol } = new URL(url)

    return protocol === 'http:' || protocol === 'https:'
  } catch {
    return false
  }
}

// 화면 표시용 주소, 프로토콜과 www. 제거
function formatLinkAddress(url: string) {
  return url.replace(/^https?:\/\//, '').replace(/^www\./, '')
}

export { formatLinkAddress, getOrganizationLinkLabel, isHttpUrl }
