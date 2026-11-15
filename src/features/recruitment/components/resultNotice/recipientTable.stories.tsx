import type { RecipientDelivery, ResultNoticeRecipient } from '@/features/recruitment/types'
import { RecipientTable } from './recipientTable'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { ReactNode } from 'react'

const meta = {
  title: 'Features/Recruitment/ResultNotice/RecipientTable',
  component: RecipientTable,
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta<typeof RecipientTable>

export default meta
// 필수 props를 render 안에서 직접 넘겨 args 타입 연결 제외
type Story = StoryObj

// 예시용 가상 인물·주소
const SAMPLE_PEOPLE = [
  { name: '강민준', position: 'development' },
  { name: '오하늘', position: 'development' },
  { name: '서지우', position: 'design' },
  { name: '최두리', position: 'planning' },
  { name: '윤서진', position: 'planning' },
  { name: '한가람', position: 'design' },
  { name: '정다온', position: 'development' },
  { name: '임보라', position: 'planning' },
] as const

function createRecipients(getDelivery: (index: number) => RecipientDelivery) {
  return SAMPLE_PEOPLE.map((person, index): ResultNoticeRecipient => ({
    id: String(index),
    ...person,
    email: `applicant${index + 1}@example.com`,
    delivery: getDelivery(index),
  }))
}

function getSentDelivery(index: number): RecipientDelivery {
  if (index === 0) {
    return { status: 'failed', message: '메일 주소를 찾을 수 없어요' }
  }

  if (index === 1) {
    return { status: 'emailCheck', message: 'gmail.com이 맞나요?' }
  }

  return { status: 'delivered' }
}

function TableFrame({ children }: { children: ReactNode }) {
  return (
    <div className="w-252.5 overflow-hidden rounded-l border border-neutral-subtle">{children}</div>
  )
}

export const BeforeSend: Story = {
  render: () => (
    <TableFrame>
      <RecipientTable
        label="합격 안내 받는 사람"
        recipients={createRecipients(() => ({ status: 'pending' }))}
      />
    </TableFrame>
  ),
}

export const AfterSend: Story = {
  render: () => (
    <TableFrame>
      <RecipientTable
        label="불합격 안내 받는 사람"
        recipients={createRecipients(getSentDelivery)}
      />
    </TableFrame>
  ),
}

export const WithStatusLabel: Story = {
  render: () => (
    <TableFrame>
      <RecipientTable
        label="불합격 안내 받는 사람"
        recipients={createRecipients(getSentDelivery)}
        statusLabel="발송 완료"
      />
    </TableFrame>
  ),
}

export const FewRecipients: Story = {
  render: () => (
    <TableFrame>
      <RecipientTable
        label="합격 안내 받는 사람"
        recipients={createRecipients(() => ({ status: 'pending' })).slice(0, 3)}
      />
    </TableFrame>
  ),
}
