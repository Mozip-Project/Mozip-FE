import type {
  RecruitmentProgress,
  RecruitmentSchedule,
  RecruitmentStage,
} from '@/features/recruitment/types'
import { formatMonthDayWithWeekday } from '@/utils/date'

const RECRUITMENT_STEP_STATUSES = ['done', 'current', 'upcoming'] as const

type RecruitmentStepStatus = (typeof RECRUITMENT_STEP_STATUSES)[number]

type RecruitmentStep = {
  stage: RecruitmentStage
  label: string
  status: RecruitmentStepStatus
  dateLabel: string | null
}

const INTERVIEW_STAGES = [
  'posting',
  'application',
  'documentReview',
  'documentResult',
  'interviewReview',
  'finalResult',
] as const satisfies readonly RecruitmentStage[]

const NO_INTERVIEW_STAGES = [
  'posting',
  'application',
  'documentReview',
  'finalResult',
] as const satisfies readonly RecruitmentStage[]

const STAGE_LABEL = {
  posting: '공고 작성',
  application: '지원 접수',
  documentReview: '서류 평가',
  documentResult: '서류 결과',
  interviewReview: '면접 평가',
  finalResult: '최종 결과',
} satisfies Record<RecruitmentStage, string>

function formatDone(date: string | null) {
  return date ? `${formatMonthDayWithWeekday(date)} 완료` : null
}

// 마감·발표일은 지나면 완료로, 평가처럼 정해진 날짜가 없는 단계는 마친 날만 표시
function getStepDateLabel(
  stage: RecruitmentStage,
  status: RecruitmentStepStatus,
  schedule: RecruitmentSchedule,
) {
  const isDone = status === 'done'

  switch (stage) {
    case 'posting':
      return isDone ? formatDone(schedule.postingCompletedAt) : null
    case 'application':
      return isDone
        ? formatDone(schedule.applicationDeadline)
        : `${formatMonthDayWithWeekday(schedule.applicationDeadline)} 마감`
    case 'documentReview':
      return isDone ? formatDone(schedule.documentReviewCompletedAt) : null
    case 'documentResult':
      return isDone
        ? formatDone(schedule.documentResultDate)
        : `${formatMonthDayWithWeekday(schedule.documentResultDate)} 발표`
    case 'interviewReview':
      return isDone ? formatDone(schedule.interviewReviewCompletedAt) : null
    case 'finalResult':
      return isDone
        ? formatDone(schedule.finalResultDate)
        : `${formatMonthDayWithWeekday(schedule.finalResultDate)} 발표`
  }
}

function getStepStatus(index: number, currentIndex: number): RecruitmentStepStatus {
  if (index < currentIndex) {
    return 'done'
  }

  return index === currentIndex ? 'current' : 'upcoming'
}

// 면접 6단계, 비면접 4단계
function getRecruitmentSteps({
  stage,
  hasInterview,
  schedule,
}: RecruitmentProgress): RecruitmentStep[] {
  const stages: readonly RecruitmentStage[] = hasInterview ? INTERVIEW_STAGES : NO_INTERVIEW_STAGES
  const currentIndex = stages.indexOf(stage)

  return stages.map((stepStage, index) => {
    const status = getStepStatus(index, currentIndex)

    return {
      stage: stepStage,
      label: STAGE_LABEL[stepStage],
      status,
      dateLabel: getStepDateLabel(stepStage, status, schedule),
    }
  })
}

export { getRecruitmentSteps, RECRUITMENT_STEP_STATUSES }
export type { RecruitmentStep, RecruitmentStepStatus }
