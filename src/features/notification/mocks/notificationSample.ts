import type { NotificationEntry } from '@/features/notification/components/notificationPanel/notificationPanel'

// TODO: 알림 API·이동 경로 확정 후 교체, 지원자 알림 1건은 Figma 미표시로 임의 지정
const NOTIFICATION_SAMPLE: NotificationEntry[] = [
  {
    id: '1',
    audience: 'organizer',
    href: '/manage',
    isRead: false,
    source: 'UXUX',
    title: '대표자 요청이 도착했어요',
    meta: '방금',
  },
  {
    id: '2',
    audience: 'organizer',
    href: '/manage',
    isRead: false,
    source: 'UXUX',
    title: '대표자 신청이 승인되었어요',
    meta: '방금',
  },
  {
    id: '3',
    audience: 'organizer',
    href: '/manage',
    isRead: false,
    source: '멋쟁이개발자',
    title: '대표자 신청이 거절되었어요',
    meta: '1시간 전',
  },
  {
    id: '4',
    audience: 'applicant',
    href: '/manage',
    isRead: true,
    source: '밴드 소리샘',
    title: '대표자 신청이 승인되었어요',
    meta: '어제',
  },
]

export { NOTIFICATION_SAMPLE }
