import type { ManagedPosting } from '@/features/posting/types'

// Figma 공고 관리 게시 중 2건·작성 중 1건·종료 1건 기준, 모두 면접 없는 모집
const MANAGED_POSTING_SAMPLE: ManagedPosting[] = [
  {
    id: '2',
    title: 'UXUX 14기 운영진 모집',
    status: 'published',
    latestRank: 18,
    canUp: true,
    progress: {
      stage: 'application',
      hasInterview: false,
      schedule: {
        postingCompletedAt: '2026-10-01',
        applicationDeadline: '2026-10-15',
        documentReviewCompletedAt: null,
        documentResultDate: '2026-10-18',
        finalResultDate: '2026-10-27',
      },
    },
  },
  {
    id: '1',
    title: 'UXUX 14기 신입 부원 모집',
    status: 'published',
    latestRank: 18,
    canUp: false,
    progress: {
      stage: 'documentReview',
      hasInterview: false,
      schedule: {
        postingCompletedAt: '2026-09-27',
        applicationDeadline: '2026-09-30',
        documentReviewCompletedAt: null,
        documentResultDate: '2026-10-18',
        finalResultDate: '2026-10-27',
      },
    },
  },
  {
    id: '3',
    title: 'UXUX 15기 운영진 추가 모집',
    status: 'draft',
    progress: {
      stage: 'posting',
      hasInterview: false,
      schedule: {
        postingCompletedAt: null,
        applicationDeadline: '2026-10-15',
        documentReviewCompletedAt: null,
        documentResultDate: '2026-10-18',
        finalResultDate: '2026-10-27',
      },
    },
  },
  {
    id: '4',
    title: 'UXUX 13기 신입 부원 모집',
    status: 'closed',
    progress: {
      stage: 'finalResult',
      hasInterview: false,
      schedule: {
        postingCompletedAt: '2026-10-01',
        applicationDeadline: '2026-10-15',
        documentReviewCompletedAt: '2026-10-27',
        documentResultDate: '2026-10-18',
        finalResultDate: '2026-10-27',
      },
    },
  },
]

export { MANAGED_POSTING_SAMPLE }
