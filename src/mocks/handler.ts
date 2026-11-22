import { notificationHandlers } from '@/features/notification/mocks/notificationHandlers'
import { organizationMemberHandlers } from '@/features/organization/mocks/organizationMemberHandlers'
import { organizationProfileHandlers } from '@/features/organization/mocks/organizationProfileHandlers'
import { postingReportHandlers } from '@/features/posting/mocks/postingReportHandlers'
import { accountEditHandlers } from '@/features/user/mocks/accountEditHandlers'
import { userHandlers } from '@/features/user/mocks/userHandlers'
import type { AnyHandler } from 'msw'

const handlers: AnyHandler[] = [
  ...notificationHandlers,
  ...postingReportHandlers,
  ...userHandlers,
  ...accountEditHandlers,
  ...organizationMemberHandlers,
  ...organizationProfileHandlers,
]

export { handlers }
