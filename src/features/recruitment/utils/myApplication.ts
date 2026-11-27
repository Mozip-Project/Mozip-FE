import type { StepperStatus, StepperStep } from '@/components/ui/Stepper/stepper'
import type { SummaryBarStatus } from '@/components/ui/SummaryBar/summaryBar'
import type { MyApplication, MyApplicationStage } from '@/features/recruitment/types'
import type { MyApplicationsQuery } from '@/gql/graphql'
import { formatMonthDayWithWeekday, formatSeoulDateTime, getSeoulIsoDate } from '@/utils/date'

// 결과를 받은 뒤에도 3단계는 완료가 아니라 현재 단계로 표시
const CURRENT_STEP_INDEX = {
  submitted: 0,
  docReview: 1,
  passed: 2,
  failed: 2,
} satisfies Record<MyApplicationStage, number>

const FAILED_MESSAGE = '아쉽지만 이번 모집에서는 함께하지 못하게 됐어요'

type MyApplicationResponse = MyApplicationsQuery['myApplications'][number]

type MyApplicationGuide = {
  status: SummaryBarStatus
  message: string
}

function getResultLabel(hasInterview: boolean) {
  return hasInterview ? '서류 결과' : '최종 결과'
}

function getStepStatus(index: number, currentIndex: number): StepperStatus {
  if (index < currentIndex) {
    return 'done'
  }

  return index === currentIndex ? 'current' : 'upcoming'
}

function getMyApplicationSteps({
  hasInterview,
  submittedAt,
  stage,
  resultDate,
}: MyApplication): StepperStep[] {
  const submittedDate = getSeoulIsoDate(new Date(submittedAt))
  const steps = [
    {
      id: 'submit',
      label: '제출',
      description: `${formatMonthDayWithWeekday(submittedDate)} 제출`,
    },
    { id: 'docReview', label: '서류 평가', description: null },
    {
      id: 'result',
      label: getResultLabel(hasInterview),
      description: resultDate ? `${formatMonthDayWithWeekday(resultDate)} 발표` : null,
    },
  ]

  return steps.map((step, index) => ({
    ...step,
    status: getStepStatus(index, CURRENT_STEP_INDEX[stage]),
  }))
}

function getMyApplicationGuide({
  hasInterview,
  stage,
  resultDate,
  interviewAt,
}: MyApplication): MyApplicationGuide {
  if (stage === 'failed') {
    return { status: 'ready', message: FAILED_MESSAGE }
  }

  if (stage === 'passed') {
    if (!hasInterview) {
      return {
        status: 'next',
        message: '최종 합격했어요. 자세한 안내는 단체에서 따로 연락할 거예요',
      }
    }

    return {
      status: 'next',
      message: interviewAt
        ? `서류에 합격했어요. 면접은 ${formatSeoulDateTime(interviewAt)}이에요`
        : '서류에 합격했어요',
    }
  }

  if (!resultDate) {
    return { status: 'ready', message: '결과 발표일이 정해지면 알림으로 알려드릴게요' }
  }

  return {
    status: 'ready',
    message: `${getResultLabel(hasInterview)}는 ${formatMonthDayWithWeekday(resultDate)}에 발표돼요`,
  }
}

// 결과 전이면 모집 마감 전은 제출, 마감 뒤는 서류 평가, 보류는 공개 전 값이라 결과 전으로 처리
function getStage({ posting, docResult, finalResult }: MyApplicationResponse): MyApplicationStage {
  const result = posting.hasInterview ? docResult : finalResult

  switch (result) {
    case 'PASS':
      return 'passed'
    case 'FAIL':
      return 'failed'
    case 'PENDING':
    case 'HOLD':
      return posting.status === 'RECRUITING' ? 'submitted' : 'docReview'
  }
}

// 제출한 지원서만 최근 제출 순으로, 작성 중은 개수만
function toMyApplications(responses: readonly MyApplicationResponse[]) {
  const applications = responses
    .flatMap((response): MyApplication[] => {
      const { id, status, submittedAt, position, posting } = response
      if (status !== 'SUBMITTED' || !submittedAt) {
        return []
      }

      const resultAt = posting.hasInterview ? posting.docResultAt : posting.finalResultAt

      return [
        {
          id,
          postingTitle: posting.title,
          positionName: position?.name ?? null,
          organizationName: posting.organization.name,
          hasInterview: posting.hasInterview,
          submittedAt,
          stage: getStage(response),
          resultDate: resultAt ? getSeoulIsoDate(new Date(resultAt)) : null,
          // TODO: 면접 일정 필드가 생기면 연결
          interviewAt: null,
        },
      ]
    })
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())

  return {
    applications,
    draftCount: responses.filter(({ status }) => status === 'DRAFT').length,
  }
}

export { getMyApplicationGuide, getMyApplicationSteps, toMyApplications }
