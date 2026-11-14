import type { OngoingRecruitment } from '@/features/recruitment/types'

// Figma 홈 진행 중인 모집 2건 기준 순서, 모두 면접 없는 모집
const ONGOING_RECRUITMENT_SAMPLE: OngoingRecruitment[] = [
  {
    id: '2',
    title: 'UXUX 14기 운영진 모집',
    progress: {
      stage: 'documentReview',
      hasInterview: false,
      schedule: {
        postingCompletedAt: '2026-09-27',
        applicationDeadline: '2026-09-30',
        documentReviewCompletedAt: '2026-10-06',
        documentResultDate: '2026-10-18',
        finalResultDate: '2026-10-27',
      },
    },
  },
  {
    id: '1',
    title: 'UXUX 14기 신입 부원 모집',
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
]

export { ONGOING_RECRUITMENT_SAMPLE }
