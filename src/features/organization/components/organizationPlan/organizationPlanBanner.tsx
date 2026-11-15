import { Banner } from '@/components/ui/Banner/banner'
import { Button } from '@/components/ui/Button/button'
import type { OrganizationPlan } from '@/features/organization/types'
import type { ComponentProps } from 'react'

type PlanBannerContent = Pick<
  ComponentProps<typeof Banner>,
  'title' | 'description' | 'tone' | 'badgeLabel'
>

function getPlanBannerContent(plan: OrganizationPlan): PlanBannerContent {
  switch (plan.status) {
    case 'trial':
      return {
        title: '이용권 무료 체험 중',
        badgeLabel: plan.remainingDays === 0 ? 'D-DAY' : `D-${plan.remainingDays}`,
        description: '체험 기간에는 모든 유료 기능을 사용할 수 있어요',
      }
    case 'trialEnded':
      return {
        tone: 'critical',
        title: '이용권 무료 체험 종료',
        description: '면접 타임테이블과 결과 안내 기능은 이용권 구매 후 사용할 수 있어요',
      }
    case 'package':
      return {
        title: plan.name,
        description: '면접 타임테이블과 결과 안내 등 모든 유료 기능을 이용할 수 있어요',
      }
  }
}

type OrganizationPlanBannerProps = {
  plan: OrganizationPlan
  upRemainingCount: number
}

function OrganizationPlanBanner({ plan, upRemainingCount }: OrganizationPlanBannerProps) {
  return (
    <Banner
      {...getPlanBannerContent(plan)}
      usage={{ label: 'UP하기 잔여', value: `${upRemainingCount}회` }}
      action={
        // TODO: 이용권 관리 경로 확정 후 연결
        <Button variant="secondary" size="m">
          이용권 관리
        </Button>
      }
    />
  )
}

export { OrganizationPlanBanner }
