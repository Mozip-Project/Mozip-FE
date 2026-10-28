import { SegmentGroup } from './segmentGroup'
import { SegmentOption } from './segmentOption'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'UI/SegmentGroup',
  component: SegmentGroup,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof SegmentGroup>

export default meta
type Story = StoryObj<typeof meta>

const RESULT_OPTIONS = [
  { value: 'pass', label: '합격', tone: 'brand' },
  { value: 'hold', label: '보류', tone: 'warning' },
  { value: 'fail', label: '불합격', tone: 'critical' },
] as const

function ResultOptions() {
  return RESULT_OPTIONS.map(({ value, label, tone }) => (
    <SegmentOption key={value} value={value} tone={tone}>
      {label}
    </SegmentOption>
  ))
}

export const Default: Story = {
  render: () => (
    <SegmentGroup aria-label="평가 결과" className="w-90">
      <ResultOptions />
    </SegmentGroup>
  ),
}

export const Selected: Story = {
  render: () => (
    <SegmentGroup aria-label="평가 결과" defaultValue="hold" className="w-90">
      <ResultOptions />
    </SegmentGroup>
  ),
}

export const Error: Story = {
  render: () => (
    <SegmentGroup aria-label="평가 결과" errorMessage="옵션을 선택해 주세요" className="w-90">
      <ResultOptions />
    </SegmentGroup>
  ),
}

// Figma SegmentGroup 옵션 5개 구성, 한 줄에 같은 폭 분배
const FIVE_OPTIONS = ['합격', '보류', '불합격', '옵션 4', '옵션 5'] as const

function FiveOptions() {
  return FIVE_OPTIONS.map((label) => (
    <SegmentOption key={label} value={label}>
      {label}
    </SegmentOption>
  ))
}

export const WithFiveOptions: Story = {
  render: () => (
    <div className="flex items-start gap-gap-xl">
      <SegmentGroup aria-label="옵션 5개" className="w-90">
        <FiveOptions />
      </SegmentGroup>
      <SegmentGroup aria-label="옵션 5개" errorMessage="옵션을 선택해 주세요" className="w-90">
        <FiveOptions />
      </SegmentGroup>
    </div>
  ),
}
