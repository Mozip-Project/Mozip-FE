import type { ToastMessage } from '@/providers/toastProvider'

// 전시회 시연 모드: 공고 작성·게시는 실서버, 목록·상세는 MSW 샘플과 실서버 공고를 함께 표시 (전시회 후 이 파일과 호출부 삭제)

// 실서버 공고 id는 숫자, MSW 샘플 공고 id는 문자
const SERVER_POSTING_ID_PATTERN = /^\d+$/

const SERVER_POSTING_UNSUPPORTED_TOAST = {
  title: '준비 중인 기능이에요',
  description: '시연에서는 샘플 공고로 확인해 주세요',
  icon: 'alert',
} satisfies ToastMessage

function isPostingDemoMode() {
  return process.env.NEXT_PUBLIC_POSTING_DEMO_MODE === 'enabled'
}

// 시연 모드에서 실서버에만 있는 공고, 서버에 없는 기능(지원하기·지원자 관리·UP 등)은 안내로 막음
function isServerPosting(postingId: string) {
  return isPostingDemoMode() && SERVER_POSTING_ID_PATTERN.test(postingId)
}

export { isPostingDemoMode, isServerPosting, SERVER_POSTING_UNSUPPORTED_TOAST }
