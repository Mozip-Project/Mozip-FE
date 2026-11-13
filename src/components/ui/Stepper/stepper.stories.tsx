import { Badge } from '@/components/ui/Badge/badge'
import { Stepper, type StepperStep } from './stepper'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'UI/Stepper',
  component: Stepper,
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta<typeof Stepper>

export default meta
type Story = StoryObj

const IN_PROGRESS_STEPS: StepperStep[] = [
  { id: 'posting', label: '공고 작성', status: 'done', description: '10/1 (목) 완료' },
  { id: 'application', label: '지원 접수', status: 'current', description: '10/15 (목) 마감' },
  { id: 'review', label: '서류 평가', status: 'upcoming' },
  { id: 'result', label: '최종 결과', status: 'upcoming', description: '10/27 (화) 발표' },
]

const WITH_BADGE_STEPS: StepperStep[] = [
  {
    id: 'posting',
    label: '공고 작성',
    status: 'current',
    badge: (
      <Badge tone="critical" variant="weak">
        작성 중
      </Badge>
    ),
  },
  { id: 'application', label: '지원 접수', status: 'upcoming', description: '10/15 (목) 마감' },
  { id: 'review', label: '서류 평가', status: 'upcoming' },
  { id: 'result', label: '최종 결과', status: 'upcoming', description: '10/27 (화) 발표' },
]

export const InProgress: Story = {
  render: () => (
    <div className="w-240">
      <Stepper label="모집 단계" steps={IN_PROGRESS_STEPS} />
    </div>
  ),
}

export const WithBadge: Story = {
  render: () => (
    <div className="w-240">
      <Stepper label="모집 단계" steps={WITH_BADGE_STEPS} />
    </div>
  ),
}
