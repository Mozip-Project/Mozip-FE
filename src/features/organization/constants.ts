import type { ToastMessage } from '@/providers/toastProvider'

// 화면이 아직 없는 메뉴·버튼 공통 안내
const COMING_SOON_TOAST = { title: '준비 중인 기능이에요', icon: 'alert' } satisfies ToastMessage

export { COMING_SOON_TOAST }
