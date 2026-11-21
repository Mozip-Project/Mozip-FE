import { notificationHandlers } from '@/features/notification/mocks/notificationHandlers'
import { organizationMemberHandlers } from '@/features/organization/mocks/organizationMemberHandlers'
import { postingReportHandlers } from '@/features/posting/mocks/postingReportHandlers'
import { userHandlers } from '@/features/user/mocks/userHandlers'
import type { AnyHandler } from 'msw'

const handlers: AnyHandler[] = [
  ...notificationHandlers,
  ...postingReportHandlers,
  ...userHandlers,
  ...organizationMemberHandlers,
]

export { handlers }
