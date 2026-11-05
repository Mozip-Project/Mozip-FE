import ChevronRightIcon from '@/assets/icons/chevronRight.svg'
import { Button } from '@/components/ui/Button/button'
import { SummaryBar } from './summaryBar'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'UI/SummaryBar',
  component: SummaryBar,
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta<typeof SummaryBar>

export default meta
type Story = StoryObj

const MESSAGE = '보류 중인 4명의 최종 결과를 선택해 주세요.'

function MessageLink() {
  return (
    <Button variant="tertiary" size="s">
      불합격 메시지 확인하기
      <ChevronRightIcon aria-hidden className="size-4 text-neutral" />
    </Button>
  )
}

function SecondaryAction() {
  return (
    <Button variant="secondary" size="m">
      서류 결과만 안내하기
    </Button>
  )
}

export const Blocked: Story = {
  render: () => (
    <SummaryBar
      status="blocked"
      link={<MessageLink />}
      actions={
        <>
          <SecondaryAction />
          <Button size="m" disabled>
            결과 확정하기
          </Button>
        </>
      }
      className="w-224.5 max-w-full"
    >
      {MESSAGE}
    </SummaryBar>
  ),
}

export const Ready: Story = {
  render: () => (
    <SummaryBar
      status="ready"
      link={<MessageLink />}
      actions={
        <>
          <SecondaryAction />
          <Button size="m">결과 확정하기</Button>
        </>
      }
      className="w-224.5 max-w-full"
    >
      {MESSAGE}
    </SummaryBar>
  ),
}

export const Next: Story = {
  render: () => (
    <SummaryBar
      status="next"
      link={<MessageLink />}
      actions={
        <>
          <SecondaryAction />
          <Button size="m">면접 타임테이블 만들기</Button>
        </>
      }
      className="w-224.5 max-w-full"
    >
      {MESSAGE}
    </SummaryBar>
  ),
}
