// 스켈레톤은 300ms 뒤에 보여 개발 중 로딩 상태를 확인할 수 있게 응답 지연, 테스트는 지연 없음
const MOCK_RESPONSE_DELAY_MS = process.env.NODE_ENV === 'test' ? 0 : 800

export { MOCK_RESPONSE_DELAY_MS }
