import { MessagePreview } from './messagePreview'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'Features/Recruitment/ResultNotice/MessagePreview',
  component: MessagePreview,
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta<typeof MessagePreview>

export default meta
// 필수 props를 render 안에서 직접 넘겨 args 타입 연결 제외
type Story = StoryObj

const SUBJECT = '14기 서류 전형 결과 안내'
const BODY = `{이름}님, UXUX 14기 서류 전형에 합격하셨습니다.
면접은 {면접 기간} 중 진행되며, 자세한 내용은 추후 안내드리겠습니다.

궁금한 점은 언제든 문의해 주세요.`

const VARIABLE_VALUES = { 이름: '김모집', '면접 기간': '10.21 (수) ~ 10.23 (금)' }

export const Default: Story = {
  render: () => (
    <MessagePreview
      mailPreviewLabel="합격 안내 메일 미리보기"
      organizationName="UXUX"
      message={{ subject: SUBJECT, body: BODY }}
      variableValues={VARIABLE_VALUES}
      className="h-112 w-95"
    />
  ),
}

export const LongBody: Story = {
  render: () => (
    <MessagePreview
      mailPreviewLabel="합격 안내 메일 미리보기"
      organizationName="UXUX"
      message={{ subject: SUBJECT, body: Array.from({ length: 6 }, () => BODY).join('\n\n') }}
      variableValues={VARIABLE_VALUES}
      className="h-112 w-95"
    />
  ),
}

export const MissingVariableValue: Story = {
  render: () => (
    <MessagePreview
      mailPreviewLabel="합격 안내 메일 미리보기"
      organizationName="UXUX"
      message={{ subject: SUBJECT, body: BODY }}
      variableValues={{ 이름: '김모집' }}
      className="h-112 w-95"
    />
  ),
}
