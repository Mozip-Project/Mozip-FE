// 로그아웃은 새로고침 이동이라 이동한 화면에서 한 번 보여 줄 안내를 탭 저장소에 표시
const LOGOUT_NOTICE_STORAGE_KEY = 'mozip_logout_notice'

// 저장소를 쓸 수 없는 브라우저에서도 로그아웃 이동은 계속되도록 실패 무시
function reserveLogoutNotice() {
  try {
    window.sessionStorage.setItem(LOGOUT_NOTICE_STORAGE_KEY, 'true')
  } catch {
    return
  }
}

// 한 번 읽으면 지워 새로고침 때 다시 뜨지 않게 처리
function takeLogoutNotice() {
  try {
    const hasNotice = window.sessionStorage.getItem(LOGOUT_NOTICE_STORAGE_KEY) !== null
    window.sessionStorage.removeItem(LOGOUT_NOTICE_STORAGE_KEY)
    return hasNotice
  } catch {
    return false
  }
}

export { reserveLogoutNotice, takeLogoutNotice }
