import {
  INTERVIEW_RECRUITMENT_STAGES,
  NO_INTERVIEW_RECRUITMENT_STAGES,
  type RecruitmentSchedule,
} from '@/features/recruitment/types'
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

const SCHEDULE: RecruitmentSchedule = {
  postingCompletedAt: '2026-10-01',
  applicationDeadline: '2026-10-15',
  documentReviewCompletedAt: '2026-10-18',
  documentResultDate: '2026-10-18',
  finalResultDate: '2026-10-27',
}

export const NoInterview: Story = {
  render: () => (
    <div className="flex w-240 flex-col gap-gap-xxl">
      {NO_INTERVIEW_RECRUITMENT_STAGES.map((stage) => (
        <RecruitmentStepper
          key={stage}
          progress={{ stage, hasInterview: false, schedule: SCHEDULE }}
        />
      ))}
    </div>
  ),
}

export const Interview: Story = {
  render: () => (
    <div className="flex w-240 flex-col gap-gap-xxl">
      {INTERVIEW_RECRUITMENT_STAGES.map((stage) => (
        <RecruitmentStepper
          key={stage}
          progress={{ stage, hasInterview: true, schedule: SCHEDULE }}
        />
      ))}
    </div>
  ),
}
