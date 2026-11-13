import { describe, expect, it } from 'vitest'
import type { RecruitmentSchedule } from '@/features/recruitment/types'
import { getRecruitmentSteps } from './recruitmentStepper'

const SCHEDULE: RecruitmentSchedule = {
  postingCompletedAt: '2026-10-01',
  applicationDeadline: '2026-10-15',
  documentReviewCompletedAt: '2026-10-18',
  documentResultDate: '2026-10-18',
  interviewReviewCompletedAt: '2026-10-23',
  finalResultDate: '2026-10-27',
}

function summarize(steps: ReturnType<typeof getRecruitmentSteps>) {
  return steps.map(({ label, status, dateLabel }) => [label, status, dateLabel])
}

describe('getRecruitmentSteps', () => {
  it('면접 없는 모집은 4단계, 작성 중에는 이후 마감·발표일만 표시', () => {
    const steps = getRecruitmentSteps({
      stage: 'posting',
      hasInterview: false,
      schedule: SCHEDULE,
    })

    expect(summarize(steps)).toEqual([
      ['공고 작성', 'current', null],
      ['지원 접수', 'upcoming', '10/15 (목) 마감'],
      ['서류 평가', 'upcoming', null],
      ['최종 결과', 'upcoming', '10/27 (화) 발표'],
    ])
  })

  it('지난 단계는 완료일, 현재 지원 접수는 마감일 표시', () => {
    const steps = getRecruitmentSteps({
      stage: 'application',
      hasInterview: false,
      schedule: SCHEDULE,
    })

    expect(summarize(steps).slice(0, 2)).toEqual([
      ['공고 작성', 'done', '10/1 (목) 완료'],
      ['지원 접수', 'current', '10/15 (목) 마감'],
    ])
  })

  it('면접 모집은 6단계, 서류 결과·최종 결과는 발표일 표시', () => {
    const steps = getRecruitmentSteps({
      stage: 'documentResult',
      hasInterview: true,
      schedule: SCHEDULE,
    })

    expect(summarize(steps)).toEqual([
      ['공고 작성', 'done', '10/1 (목) 완료'],
      ['지원 접수', 'done', '10/15 (목) 완료'],
      ['서류 평가', 'done', '10/18 (일) 완료'],
      ['서류 결과', 'current', '10/18 (일) 발표'],
      ['면접 평가', 'upcoming', null],
      ['최종 결과', 'upcoming', '10/27 (화) 발표'],
    ])
  })

  it('완료일이 아직 없는 평가 단계는 날짜 생략', () => {
    const steps = getRecruitmentSteps({
      stage: 'finalResult',
      hasInterview: false,
      schedule: { ...SCHEDULE, documentReviewCompletedAt: null },
    })

    expect(steps[2]).toMatchObject({ label: '서류 평가', status: 'done', dateLabel: null })
  })
})
