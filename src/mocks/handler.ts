import { notificationHandlers } from '@/features/notification/mocks/notificationHandlers'
import { postingReportHandlers } from '@/features/posting/mocks/postingReportHandlers'
import type { AnyHandler } from 'msw'

const handlers: AnyHandler[] = [...notificationHandlers, ...postingReportHandlers]

export { handlers }
