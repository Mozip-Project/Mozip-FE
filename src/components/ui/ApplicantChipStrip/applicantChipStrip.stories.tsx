import { useState } from 'react'
import { ApplicantChipStrip, type StripApplicant } from './applicantChipStrip'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'UI/ApplicantChipStrip',
  component: ApplicantChipStrip,
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta<typeof ApplicantChipStrip>

export default meta
type Story = StoryObj

const APPLICANTS: StripApplicant[] = [
  { id: '1', name: '송유진', isDone: true },
  { id: '2', name: '김모집', isDone: false },
  { id: '3', name: '오하늘', isDone: false },
  { id: '4', name: '서지우', isDone: false },
  { id: '5', name: '최두리', isDone: false },
  { id: '6', name: '한나래', isDone: false },
  { id: '7', name: '윤가람', isDone: false },
  { id: '8', name: '정바다', isDone: false },
]

function InteractiveStrip() {
  const [currentId, setCurrentId] = useState('2')

  return (
    <div className="w-235 max-w-full">
      <ApplicantChipStrip
        label="지원자 목록"
        applicants={APPLICANTS}
        currentId={currentId}
        onSelect={setCurrentId}
      />
    </div>
  )
}

export const Default: Story = {
  render: () => <InteractiveStrip />,
}
