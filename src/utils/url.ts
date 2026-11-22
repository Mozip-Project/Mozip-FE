const PROTOCOL_PATTERN = /^[a-z][a-z\d+.-]*:\/\//i

// 프로토콜 없이 붙여 넣은 주소(behance.net/mozip)도 https로 보고 판단, 주소가 아니면 null
function toWebUrl(input: string) {
  const trimmed = input.trim()

  if (!trimmed || /\s/.test(trimmed)) {
    return null
  }

  const withProtocol = PROTOCOL_PATTERN.test(trimmed) ? trimmed : `https://${trimmed}`

  try {
    const url = new URL(withProtocol)
    const isWebProtocol = url.protocol === 'http:' || url.protocol === 'https:'
    // localhost·사내 주소 같은 점 없는 호스트는 지원서 링크로 받지 않음
    const hasDomain = url.hostname.includes('.') && !url.hostname.endsWith('.')
    // https를 붙이면 아이디로 해석되는 mailto: 같은 주소 차단
    const hasCredentials = url.username !== '' || url.password !== ''

    return isWebProtocol && hasDomain && !hasCredentials ? url.href : null
  } catch {
    return null
  }
}

export { toWebUrl }
