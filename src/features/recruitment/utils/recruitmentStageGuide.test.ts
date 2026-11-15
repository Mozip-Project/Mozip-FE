import { describe, expect, it } from 'vitest'
import type { InterviewRecruitmentStage, RecruitmentSchedule } from '@/features/recruitment/types'
import { getRecruitmentStageGuideMessage } from './recruitmentStageGuide'

const SCHEDULE: RecruitmentSchedule = {
  postingCompletedAt: '2026-10-01',
  applicationDeadline: '2026-10-15',
  documentReviewCompletedAt: null,
  documentResultDate: '2026-10-18',
  finalResultDate: '2026-10-27',
}

describe('getRecruitmentStageGuideMessage', () => {
  it.each<[InterviewRecruitmentStage, string]>([
    ['posting', '공고 작성을 완료해 주세요'],
    ['application', '지원 접수가 10/15 (목)에 마감돼요'],
    ['documentReview', '10/18 (일)에 서류 결과가 안내될 예정이에요'],
    ['documentResult', '10/18 (일)까지 서류 결과를 안내해 주세요'],
  ])('면접 모집의 %s 단계는 해당 일정으로 안내 문구 생성', (stage, message) => {
    expect(getRecruitmentStageGuideMessage({ stage, hasInterview: true, schedule: SCHEDULE })).toBe(
      message,
    )
  })

  it('면접 없는 모집의 서류 평가 단계는 최종 결과 일정으로 안내', () => {
    expect(
      getRecruitmentStageGuideMessage({
        stage: 'documentReview',
        hasInterview: false,
        schedule: SCHEDULE,
      }),
    ).toBe('10/27 (화)에 최종 결과가 안내될 예정이에요')
  })

  it('면접 없는 모집의 최종 결과 단계는 최종 결과 발표일까지 안내 요청', () => {
    expect(
      getRecruitmentStageGuideMessage({
        stage: 'finalResult',
        hasInterview: false,
        schedule: SCHEDULE,
      }),
    ).toBe('10/27 (화)까지 최종 결과를 안내해 주세요')
  })
})
