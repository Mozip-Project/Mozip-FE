import sampleThumbnail from '@/assets/images/sampleThumbnail.png'
import { Badge } from '@/components/ui/Badge/badge'
import { JobCard } from './jobCard'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'UI/JobCard',
  component: JobCard,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof JobCard>

export default meta
type Story = StoryObj

const SAMPLE_JOB = {
  href: '/',
  title: 'UI/UX 디자인 동아리 14기 모집',
  organizationType: '동아리',
  organizationName: 'UXUX',
  badge: (
    <Badge tone="critical" variant="weak">
      마감 D-1
    </Badge>
  ),
  tags: ['면접 있음', '회비 3만원/학기', '신촌'],
} as const

export const Default: Story = {
  render: () => (
    <div className="w-[282px]">
      <JobCard {...SAMPLE_JOB} />
    </div>
  ),
}

export const WithThumbnail: Story = {
  render: () => (
    <div className="w-[282px]">
      <JobCard {...SAMPLE_JOB} thumbnailSrc={sampleThumbnail.src} />
    </div>
  ),
}
