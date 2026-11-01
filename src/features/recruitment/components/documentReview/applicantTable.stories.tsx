import {
  ApplicantRow,
  ApplicantSkeletonRow,
  ApplicantTable,
  ApplicantTableHead,
} from './applicantTable'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'Features/Recruitment/ApplicantTable',
  component: ApplicantTable,
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta<typeof ApplicantTable>

export default meta
// 필수 props를 render 안에서 직접 넘겨 args 타입 연결 제외
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <ApplicantTable label="지원자 목록">
      <ApplicantTableHead />
      <ApplicantRow href="/" name="김모집" position="디자인" submittedAt="10.10" />
      <ApplicantRow href="/" name="이모집" position="개발" submittedAt="10.11" isEvaluated />
    </ApplicantTable>
  ),
}

export const Loading: Story = {
  render: () => (
    <ApplicantTable label="지원자 목록" isLoading>
      <ApplicantTableHead />
      <ApplicantSkeletonRow />
      <ApplicantSkeletonRow />
      <ApplicantSkeletonRow />
    </ApplicantTable>
  ),
}
