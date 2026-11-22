import { SentMessageCard } from './sentMessageCard'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'Features/Recruitment/ResultNotice/SentMessageCard',
  component: SentMessageCard,
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta<typeof SentMessageCard>

export default meta
// 필수 props를 render 안에서 직접 넘겨 args 타입 연결 제외
type Story = StoryObj

const SUBJECT = '14기 서류 전형 결과 안내'

export const Pass: Story = {
  render: () => (
    <div className="w-253">
      <SentMessageCard
        title="합격 안내 메시지"
        target="pass"
        organizationName="UXUX"
        message={{
          subject: SUBJECT,
          body: `{이름}님, UXUX 14기 서류 전형에 합격하셨습니다.
이후 일정은 추후 안내드리겠습니다.

궁금한 점은 언제든 문의해 주세요.`,
        }}
        variableValues={{ 이름: '김모집' }}
      />
    </div>
  ),
}

export const Fail: Story = {
  render: () => (
    <div className="w-253">
      <SentMessageCard
        title="불합격 안내 메시지"
        target="fail"
        organizationName="UXUX"
        message={{
          subject: SUBJECT,
          body: `{이름}님, UXUX 14기에 관심을 갖고 지원해 주셔서 감사합니다.
아쉽게도 이번 서류 전형에서는 함께하지 못하게 되었습니다.

다음 기회에 다시 만나길 바랍니다.`,
        }}
        variableValues={{ 이름: '김모집' }}
      />
    </div>
  ),
}
