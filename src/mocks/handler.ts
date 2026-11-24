import { notificationHandlers } from '@/features/notification/mocks/notificationHandlers'
import { organizationMemberHandlers } from '@/features/organization/mocks/organizationMemberHandlers'
import { organizationProfileHandlers } from '@/features/organization/mocks/organizationProfileHandlers'
import { managedPostingHandlers } from '@/features/posting/mocks/managedPostingHandlers'
import { postingDetailHandlers } from '@/features/posting/mocks/postingDetailHandlers'
import { postingListHandlers } from '@/features/posting/mocks/postingListHandlers'
import { postingReportHandlers } from '@/features/posting/mocks/postingReportHandlers'
import { applicationFormHandlers } from '@/features/recruitment/mocks/applicationFormHandlers'
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
]

export { handlers }
