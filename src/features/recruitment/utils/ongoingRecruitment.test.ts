import { describe, expect, it } from 'vitest'
import type { OngoingRecruitment, RecruitmentSchedule } from '@/features/recruitment/types'
import { sortByUpcomingSchedule } from './ongoingRecruitment'

const SCHEDULE: RecruitmentSchedule = {
  postingCompletedAt: '2026-10-01',
  applicationDeadline: '2026-10-15',
  documentReviewCompletedAt: null,
  documentResultDate: '2026-10-18',
  finalResultDate: '2026-10-27',
}

function createRecruitment(id: string, progress: OngoingRecruitment['progress']) {
  return { id, title: id, progress }
}

describe('sortByUpcomingSchedule', () => {
  it('현재 단계의 마감·발표일이 빠른 모집부터, 작성 중인 공고는 마지막', () => {
    const recruitments = [
      createRecruitment('draft', { stage: 'posting', hasInterview: false, schedule: SCHEDULE }),
      createRecruitment('final', {
        stage: 'documentReview',
        hasInterview: false,
        schedule: SCHEDULE,
      }),
      createRecruitment('documentResult', {
        stage: 'documentReview',
        hasInterview: true,
        schedule: SCHEDULE,
      }),
      createRecruitment('application', {
        stage: 'application',
        hasInterview: true,
        schedule: SCHEDULE,
      }),
    ]

    expect(sortByUpcomingSchedule(recruitments).map(({ id }) => id)).toEqual([
      'application',
      'documentResult',
      'final',
      'draft',
    ])
  })
})
