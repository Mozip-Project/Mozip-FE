import { notificationHandlers } from '@/features/notification/mocks/notificationHandlers'
import type { AnyHandler } from 'msw'

const handlers: AnyHandler[] = [...notificationHandlers]

export { handlers }
