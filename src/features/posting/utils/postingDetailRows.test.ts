import { describe, expect, it } from 'vitest'
import type { ManagedPostingDetail } from '@/features/posting/types'
import { getPostingDetailRows } from './postingDetailRows'

const DETAIL: ManagedPostingDetail = {
  id: 'posting-1',
  recruitmentId: '1',
  title: 'UXUX 14기 신입 부원 모집',
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
    tags: [],
  },
}

const COMMON_TAIL_ROWS = [
  { label: '활동 지역', value: '신촌, 온라인 병행' },
  { label: '회비', value: '학기당 30,000원' },
  { label: '지원 자격', value: '대학생/ 휴학생 (1~3학년, 졸업 예정자 가능)' },
]

describe('getPostingDetailRows', () => {
  it('면접 모집은 면접 일정과 방식까지 표시', () => {
    expect(getPostingDetailRows(DETAIL)).toEqual([
      { label: '모집 기간', value: '10/1 (수) ~ 10/15 (수) 23:59' },
      { label: '서류 결과 및 면접 일정 안내', value: '10/18 (토)' },
      { label: '면접 기간', value: '10/21 (화) ~ 10/23 (목)' },
      { label: '최종 발표', value: '10/27 (월)' },
      { label: '면접', value: '있음 (대면)' },
      ...COMMON_TAIL_ROWS,
    ])
  })

  it('면접 없는 모집은 면접 행 없이 서류 결과 발표로 표시', () => {
    expect(getPostingDetailRows({ ...DETAIL, interview: null })).toEqual([
      { label: '모집 기간', value: '10/1 (수) ~ 10/15 (수) 23:59' },
      { label: '서류 결과 발표', value: '10/18 (토)' },
      { label: '최종 발표', value: '10/27 (월)' },
      ...COMMON_TAIL_ROWS,
    ])
  })
})
