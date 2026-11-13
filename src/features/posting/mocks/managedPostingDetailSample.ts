import type { ManagedPostingDetail } from '@/features/posting/types'
import { MANAGED_POSTING_SAMPLE } from './managedPostingSample'

// Figma 공고 관리 상세 기준, 요일이 2025년 달력이라 날짜도 2025년 사용
const SAMPLE_DETAIL = {
  postingDeadlineLabel: '게시 마감 D-5',
  recruitmentStartsAt: '2025-10-01T00:00',
  recruitmentEndsAt: '2025-10-15T23:59',
  documentResultDate: '2025-10-18',
  interview: { method: '대면', startDate: '2025-10-21', endDate: '2025-10-23' },
  finalResultDate: '2025-10-27',
  activityArea: '신촌, 온라인 병행',
  membershipFee: '학기당 30,000원',
  eligibility: '대학생/ 휴학생 (1~3학년, 졸업 예정자 가능)',
  applicantCount: 48,
  preview: {
    title: 'UI/UX 디자인 동아리 14기 모집',
    organizationType: '동아리',
    organizationName: 'UXUX',
    deadlineLabel: '모집 D-5',
    tags: ['면접 있음', '회비 3만원/학기', '신촌/온라인 병행'],
  },
}

// 목록 샘플과 별개로 Figma 면접(신입 부원)·비면접(운영진) 상세 시안 기준
const NO_INTERVIEW_POSTING_ID = 'posting-2'

const MANAGED_POSTING_DETAIL_SAMPLE: ManagedPostingDetail[] = MANAGED_POSTING_SAMPLE.map(
  ({ id, recruitmentId, title }) => ({
    ...SAMPLE_DETAIL,
    id,
    recruitmentId,
    title,
    interview: id === NO_INTERVIEW_POSTING_ID ? null : SAMPLE_DETAIL.interview,
  }),
)

export { MANAGED_POSTING_DETAIL_SAMPLE }
