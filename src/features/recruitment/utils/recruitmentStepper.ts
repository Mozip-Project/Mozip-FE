import type { StepperStatus } from '@/components/ui/Stepper/stepper'
import {
  INTERVIEW_RECRUITMENT_STAGES,
  NO_INTERVIEW_RECRUITMENT_STAGES,
  type RecruitmentProgress,
  type RecruitmentSchedule,
  type RecruitmentStage,
} from '@/features/recruitment/types'
import { formatMonthDayWithWeekday } from '@/utils/date'

type RecruitmentStep = {
  stage: RecruitmentStage
  label: string
  status: StepperStatus
  dateLabel: string | null
}

const STAGE_LABEL = {
  posting: '공고 작성',
  application: '지원 접수',
  documentReview: '서류 평가',
  documentResult: '서류 결과',
  finalResult: '최종 결과',
} satisfies Record<RecruitmentStage, string>

function formatDone(date: string | null) {
  return date ? `${formatMonthDayWithWeekday(date)} 완료` : null
}

// 마감·발표일은 지나면 완료로, 서류 평가는 진행 중이어도 결과 확정일 표시
function getStepDateLabel(
  stage: RecruitmentStage,
  status: StepperStatus,
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
      return status === 'upcoming' ? null : formatDone(schedule.documentReviewCompletedAt)
    case 'documentResult':
      return isDone
        ? formatDone(schedule.documentResultDate)
        : `${formatMonthDayWithWeekday(schedule.documentResultDate)} 발표`
    case 'finalResult':
      return isDone
        ? formatDone(schedule.finalResultDate)
        : `${formatMonthDayWithWeekday(schedule.finalResultDate)} 발표`
  }
}

function getStepStatus(index: number, currentIndex: number): StepperStatus {
  if (index < currentIndex) {
    return 'done'
  }

  return index === currentIndex ? 'current' : 'upcoming'
}

// 면접 여부와 관계없이 4단계, 마지막 단계만 서류 결과·최종 결과로 구분
function getRecruitmentSteps({
  stage,
  hasInterview,
  schedule,
}: RecruitmentProgress): RecruitmentStep[] {
  const stages: readonly RecruitmentStage[] = hasInterview
    ? INTERVIEW_RECRUITMENT_STAGES
    : NO_INTERVIEW_RECRUITMENT_STAGES
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

export { getRecruitmentSteps }
export type { RecruitmentStep }
