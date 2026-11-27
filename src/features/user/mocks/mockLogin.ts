// TODO: 로그인 화면 API 연결 후 삭제
const MOCK_LOGIN_STORAGE_KEY = 'mozip_mock_logged_in'
const LOGGED_IN_VALUE = 'true'

// 새로고침에는 유지, 탭을 닫으면 로그아웃. 서버(MSW node)는 저장소가 없어 로그인 상태로 처리
function isMockLoggedIn() {
  if (typeof window === 'undefined') {
    return true
  }
  return window.sessionStorage.getItem(MOCK_LOGIN_STORAGE_KEY) === LOGGED_IN_VALUE
}

function setMockLoggedIn(isLoggedIn: boolean) {
  if (typeof window === 'undefined') {
    return
  }
  if (isLoggedIn) {
    window.sessionStorage.setItem(MOCK_LOGIN_STORAGE_KEY, LOGGED_IN_VALUE)
    return
  }
  window.sessionStorage.removeItem(MOCK_LOGIN_STORAGE_KEY)
}

export { isMockLoggedIn, setMockLoggedIn }
