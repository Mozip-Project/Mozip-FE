import type { RecruitmentProgress, RecruitmentStage } from '@/features/recruitment/types'
import { RecruitmentStepper } from './recruitmentStepper'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'Features/Recruitment/RecruitmentStage/RecruitmentStepper',
  component: RecruitmentStepper,
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta<typeof RecruitmentStepper>

export default meta
// 필수 props를 render 안에서 직접 넘겨 args 타입 연결 제외
type Story = StoryObj

const SCHEDULE: RecruitmentProgress['schedule'] = {
  postingCompletedAt: '2026-10-01',
  applicationDeadline: '2026-10-15',
  documentReviewCompletedAt: '2026-10-18',
  documentResultDate: '2026-10-18',
  interviewReviewCompletedAt: '2026-10-23',
  finalResultDate: '2026-10-27',
}

const NO_INTERVIEW_STAGES = [
  'posting',
  'application',
  'documentReview',
  'finalResult',
] as const satisfies readonly RecruitmentStage[]

const INTERVIEW_STAGES = [
  'posting',
  'application',
  'documentReview',
  'documentResult',
  'interviewReview',
  'finalResult',
] as const satisfies readonly RecruitmentStage[]

function StageList({
  stages,
  hasInterview,
}: {
  stages: readonly RecruitmentStage[]
  hasInterview: boolean
}) {
  return (
    <div className="flex w-240 flex-col gap-gap-xxl">
      {stages.map((stage) => (
        <RecruitmentStepper key={stage} progress={{ stage, hasInterview, schedule: SCHEDULE }} />
      ))}
    </div>
  )
}

export const NoInterview: Story = {
  render: () => <StageList stages={NO_INTERVIEW_STAGES} hasInterview={false} />,
}

export const Interview: Story = {
  render: () => <StageList stages={INTERVIEW_STAGES} hasInterview />,
}
