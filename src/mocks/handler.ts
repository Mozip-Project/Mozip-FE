import { notificationHandlers } from '@/features/notification/mocks/notificationHandlers'
import { organizationMemberHandlers } from '@/features/organization/mocks/organizationMemberHandlers'
import { organizationProfileHandlers } from '@/features/organization/mocks/organizationProfileHandlers'
import { managedPostingHandlers } from '@/features/posting/mocks/managedPostingHandlers'
import { postingDetailHandlers } from '@/features/posting/mocks/postingDetailHandlers'
import { postingListHandlers } from '@/features/posting/mocks/postingListHandlers'
import { postingReportHandlers } from '@/features/posting/mocks/postingReportHandlers'
import { applicantManagementHandlers } from '@/features/recruitment/mocks/applicantManagementHandlers'
import { applicationFormHandlers } from '@/features/recruitment/mocks/applicationFormHandlers'
import { documentResultHandlers } from '@/features/recruitment/mocks/documentResultHandlers'
import { documentReviewHandlers } from '@/features/recruitment/mocks/documentReviewHandlers'
import { recruitmentPostingHandlers } from '@/features/recruitment/mocks/recruitmentPostingHandlers'
import { accountEditHandlers } from '@/features/user/mocks/accountEditHandlers'
import { userHandlers } from '@/features/user/mocks/userHandlers'
import type { AnyHandler } from 'msw'

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
  ...recruitmentPostingHandlers,
  ...applicantManagementHandlers,
  ...documentReviewHandlers,
  ...documentResultHandlers,
]

export { handlers }
