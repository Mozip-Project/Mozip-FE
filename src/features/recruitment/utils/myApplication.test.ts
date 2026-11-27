import { describe, expect, it } from 'vitest'
import type { MyApplication } from '@/features/recruitment/types'
import type { MyApplicationsQuery } from '@/gql/graphql'
import { getMyApplicationGuide, getMyApplicationSteps, toMyApplications } from './myApplication'

const APPLICATION: MyApplication = {
  id: '1',
  postingTitle: '14기 신입부원 모집',
  positionName: '디자인',
  organizationName: '가상 동아리',
  hasInterview: true,
  submittedAt: '2026-10-10T14:32:00+09:00',
  stage: 'submitted',
  resultDate: '2026-10-18',
  interviewAt: null,
}

function summarize(steps: ReturnType<typeof getMyApplicationSteps>) {
  return steps.map(({ label, status, description }) => [label, status, description])
}

describe('getMyApplicationSteps', () => {
  it('제출 직후에는 1단계가 현재, 3단계에 발표일 표시', () => {
    expect(summarize(getMyApplicationSteps(APPLICATION))).toEqual([
      ['제출', 'current', '10/10 (토) 제출'],
      ['서류 평가', 'upcoming', null],
      ['서류 결과', 'upcoming', '10/18 (일) 발표'],
    ])
  })

  it('면접 없는 모집은 3단계가 최종 결과', () => {
    const steps = getMyApplicationSteps({ ...APPLICATION, hasInterview: false, stage: 'docReview' })

    expect(summarize(steps)).toEqual([
      ['제출', 'done', '10/10 (토) 제출'],
      ['서류 평가', 'current', null],
      ['최종 결과', 'upcoming', '10/18 (일) 발표'],
    ])
  })

  it('결과를 받으면 합격·불합격 모두 3단계가 현재', () => {
    const passed = getMyApplicationSteps({ ...APPLICATION, stage: 'passed' })
    const failed = getMyApplicationSteps({ ...APPLICATION, stage: 'failed' })

    expect(passed.map((step) => step.status)).toEqual(['done', 'done', 'current'])
    expect(failed.map((step) => step.status)).toEqual(['done', 'done', 'current'])
  })

  it('발표일 미정이면 3단계 날짜 숨김', () => {
    const steps = getMyApplicationSteps({ ...APPLICATION, resultDate: null })

    expect(steps[2]?.description).toBeNull()
  })

  it('자정 직전 UTC 제출도 한국 날짜로 표시', () => {
    const steps = getMyApplicationSteps({ ...APPLICATION, submittedAt: '2026-10-09T15:30:00Z' })

    expect(steps[0]?.description).toBe('10/10 (토) 제출')
  })
})

describe('getMyApplicationGuide', () => {
  it('결과 전에는 발표일 안내', () => {
    expect(getMyApplicationGuide(APPLICATION)).toEqual({
      status: 'ready',
      message: '서류 결과는 10/18 (일)에 발표돼요',
    })
    expect(
      getMyApplicationGuide({ ...APPLICATION, hasInterview: false, stage: 'docReview' }),
    ).toEqual({ status: 'ready', message: '최종 결과는 10/18 (일)에 발표돼요' })
  })

  it('발표일 미정이면 알림 안내', () => {
    expect(getMyApplicationGuide({ ...APPLICATION, resultDate: null })).toEqual({
      status: 'ready',
      message: '결과 발표일이 정해지면 알림으로 알려드릴게요',
    })
  })

  it('서류 합격은 면접 일정이 있으면 함께 안내', () => {
    expect(
      getMyApplicationGuide({
        ...APPLICATION,
        stage: 'passed',
        interviewAt: '2026-10-21T13:00:00+09:00',
      }),
    ).toEqual({ status: 'next', message: '서류에 합격했어요. 면접은 10/21 (수) 13:00이에요' })
    expect(getMyApplicationGuide({ ...APPLICATION, stage: 'passed' })).toEqual({
      status: 'next',
      message: '서류에 합격했어요',
    })
  })

  it('면접 없는 모집의 합격은 최종 합격 안내', () => {
    expect(getMyApplicationGuide({ ...APPLICATION, hasInterview: false, stage: 'passed' })).toEqual(
      {
        status: 'next',
        message: '최종 합격했어요. 자세한 안내는 단체에서 따로 연락할 거예요',
      },
    )
  })

  it('불합격은 면접 여부와 무관하게 같은 문구', () => {
    const message = '아쉽지만 이번 모집에서는 함께하지 못하게 됐어요'

    expect(getMyApplicationGuide({ ...APPLICATION, stage: 'failed' })).toEqual({
      status: 'ready',
      message,
    })
    expect(getMyApplicationGuide({ ...APPLICATION, hasInterview: false, stage: 'failed' })).toEqual(
      { status: 'ready', message },
    )
  })
})

type MyApplicationResponse = MyApplicationsQuery['myApplications'][number]

function createResponse(
  response: Partial<Omit<MyApplicationResponse, 'posting'>> = {},
  posting: Partial<MyApplicationResponse['posting']> = {},
): MyApplicationResponse {
  return {
    id: '1',
    status: 'SUBMITTED',
    submittedAt: '2026-10-10T14:32:00+09:00',
    docResult: 'PENDING',
    finalResult: 'PENDING',
    position: { id: 'design', name: '디자인' },
    ...response,
    posting: {
      id: 'posting',
      title: '14기 신입부원 모집',
      status: 'RECRUITING',
      hasInterview: true,
      docResultAt: '2026-10-18T18:00:00+09:00',
      finalResultAt: '2026-10-27T18:00:00+09:00',
      organization: { name: '가상 동아리' },
      ...posting,
    },
  }
}

function getStages(responses: MyApplicationResponse[]) {
  return toMyApplications(responses).applications.map(({ stage }) => stage)
}

describe('toMyApplications', () => {
  it('제출한 지원서만 최근 제출 순으로, 작성 중은 개수만', () => {
    const { applications, draftCount } = toMyApplications([
      createResponse({ id: 'old', submittedAt: '2026-10-05T10:00:00+09:00' }),
      createResponse({ id: 'draft', status: 'DRAFT', submittedAt: null }),
      createResponse({ id: 'new', submittedAt: '2026-10-10T10:00:00+09:00' }),
    ])

    expect(applications.map(({ id }) => id)).toEqual(['new', 'old'])
    expect(draftCount).toBe(1)
  })

  it('면접 있는 모집은 서류 결과와 서류 발표일, 없는 모집은 최종 결과와 최종 발표일 사용', () => {
    const [withInterview, withoutInterview] = toMyApplications([
      createResponse({ id: 'a', docResult: 'PASS', submittedAt: '2026-10-11T10:00:00+09:00' }),
      createResponse(
        { id: 'b', docResult: 'PASS', finalResult: 'FAIL', position: null },
        { hasInterview: false, status: 'FINAL_RESULT' },
      ),
    ]).applications

    expect(withInterview).toMatchObject({ stage: 'passed', resultDate: '2026-10-18' })
    expect(withoutInterview).toMatchObject({
      stage: 'failed',
      resultDate: '2026-10-27',
      positionName: null,
    })
  })

  it('결과 전에는 모집 중이면 제출, 마감 뒤면 서류 평가', () => {
    expect(
      getStages([
        createResponse(),
        createResponse({}, { status: 'DOC_REVIEW' }),
        createResponse({ docResult: 'HOLD' }, { status: 'DOC_REVIEW' }),
        createResponse({ docResult: 'FAIL' }, { status: 'DOC_RESULT_NOTICE' }),
      ]),
    ).toEqual(['submitted', 'docReview', 'docReview', 'failed'])
  })

  it('발표일이 없으면 null', () => {
    const { applications } = toMyApplications([createResponse({}, { docResultAt: null })])

    expect(applications[0]?.resultDate).toBeNull()
  })
})
