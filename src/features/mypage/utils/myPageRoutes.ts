import type { Route } from 'next'

type MyPageMode = 'applicant' | 'organizer'

type MyPagePaths = {
  accountSettings: Route
  accountEdit: Route
  notificationSettings: Route
}

// 들어온 모드의 GNB를 유지하도록 모드별 경로 분리
const MY_PAGE_PATHS = {
  applicant: {
    accountSettings: '/mypage',
    accountEdit: '/mypage/edit',
    notificationSettings: '/mypage/notifications',
  },
  organizer: {
    accountSettings: '/manage/mypage',
    accountEdit: '/manage/mypage/edit',
    notificationSettings: '/manage/mypage/notifications',
  },
} satisfies Record<MyPageMode, MyPagePaths>

export { MY_PAGE_PATHS }
export type { MyPageMode }
