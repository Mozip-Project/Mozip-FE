import { Button } from '@/components/ui/Button/button'
import { Banner } from './banner'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'UI/Banner',
  component: Banner,
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta<typeof Banner>

export default meta
// 필수 props를 render 안에서 직접 넘겨 args 타입 연결 제외
type Story = StoryObj

const PASS_USAGE = { label: 'UP하기 잔여', value: '1회' }

function PassManageButton() {
  return (
    <Button variant="secondary" size="m">
      이용권 관리
    </Button>
  )
}

export const PassStatus: Story = {
  render: () => (
    <div className="flex w-300 flex-col gap-gap-l">
      <Banner
        title="이용권 무료 체험 중"
        badgeLabel="D-12"
        description="체험 기간에는 모든 유료 기능을 사용할 수 있어요"
        usage={PASS_USAGE}
        action={<PassManageButton />}
      />
      <Banner
        tone="critical"
        title="이용권 무료 체험 종료"
        description="면접 타임테이블과 결과 안내 기능은 이용권 구매 후 사용할 수 있어요"
        usage={PASS_USAGE}
        action={<PassManageButton />}
      />
      <Banner
        title="2026-2 패키지 이용권"
        description="면접 타임테이블과 결과 안내 등 모든 유료 기능을 이용할 수 있어요"
        usage={PASS_USAGE}
        action={<PassManageButton />}
      />
    </div>
  ),
}

export const RecruitUp: Story = {
  render: () => (
    <Banner
      title="UXUX 14기 신입 부원 모집"
      badgeLabel="D-12"
      description="현재 교내 공고 18위에요"
      action={
        <Button variant="secondary" size="m">
          전체 공고에서 UP 하기
        </Button>
      }
      className="w-300"
    />
  ),
}
