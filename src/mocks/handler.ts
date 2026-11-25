import { notificationHandlers } from '@/features/notification/mocks/notificationHandlers'
import { organizationMemberHandlers } from '@/features/organization/mocks/organizationMemberHandlers'
import { organizationProfileHandlers } from '@/features/organization/mocks/organizationProfileHandlers'
import { managedPostingHandlers } from '@/features/posting/mocks/managedPostingHandlers'
import { postingDetailHandlers } from '@/features/posting/mocks/postingDetailHandlers'
import { postingDraftHandlers } from '@/features/posting/mocks/postingDraftHandlers'
import { postingListHandlers } from '@/features/posting/mocks/postingListHandlers'
import { postingReportHandlers } from '@/features/posting/mocks/postingReportHandlers'
import { applicantManagementHandlers } from '@/features/recruitment/mocks/applicantManagementHandlers'
import { applicationFormHandlers } from '@/features/recruitment/mocks/applicationFormHandlers'
import { documentReviewHandlers } from '@/features/recruitment/mocks/documentReviewHandlers'
import { accountEditHandlers } from '@/features/user/mocks/accountEditHandlers'
import { userHandlers } from '@/features/user/mocks/userHandlers'
import type { AnyHandler } from 'msw'

// 전시회 시연 모드는 공고 작성 저장·조회·게시를 실제 서버로 보냄 (전시회 후 삭제)
const isPostingDemoMode = process.env.NEXT_PUBLIC_POSTING_DEMO_MODE === 'enabled'

const handlers: AnyHandler[] = [
  ...notificationHandlers,
  ...postingListHandlers,
  ...postingDetailHandlers,
  ...postingReportHandlers,
  ...applicationFormHandlers,
  ...userHandlers,
  ...accountEditHandlers,
  ...organizationMemberHandlers,
  ...organizationProfileHandlers,
  ...managedPostingHandlers,
  ...(isPostingDemoMode ? [] : postingDraftHandlers),
  ...applicantManagementHandlers,
  ...documentReviewHandlers,
]

export { handlers }
