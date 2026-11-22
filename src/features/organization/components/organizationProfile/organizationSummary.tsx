import BadgeCheckIcon from '@/assets/icons/badgeCheck.svg'
import BuildingIcon from '@/assets/icons/building.svg'
import MegaphoneIcon from '@/assets/icons/megaphone.svg'
import UsersIcon from '@/assets/icons/users.svg'
import type { OrganizationSummary as OrganizationSummaryValues } from '@/features/organization/utils/organizationProfile'
import type { FC, SVGProps } from 'react'

// 인증을 마친 단체만 단체 관리에 들어올 수 있어 항상 완료
const CERTIFIED_LABEL = '완료'

type SummaryItem = {
  key: string
  label: string
  icon: FC<SVGProps<SVGSVGElement>>
  value: string
}

type OrganizationSummaryProps = {
  summary: OrganizationSummaryValues
}

function toSummaryItems({ type, scope, school }: OrganizationSummaryValues): SummaryItem[] {
  const schoolItem: SummaryItem[] = school
    ? [{ key: 'school', label: '학교', icon: BuildingIcon, value: school }]
    : []

  return [
    { key: 'type', label: '단체 유형', icon: UsersIcon, value: type },
    { key: 'scope', label: '공고 범위', icon: MegaphoneIcon, value: scope },
    ...schoolItem,
    { key: 'certification', label: '단체 인증', icon: BadgeCheckIcon, value: CERTIFIED_LABEL },
  ]
}

// 데스크톱은 카드 수(연합 3개, 교내 4개)만큼 같은 폭으로 한 줄 배치
// TODO: Figma는 데스크톱만 있어 좁은 화면 배치 디자인 확인 필요
function OrganizationSummary({ summary }: OrganizationSummaryProps) {
  return (
    <dl className="grid grid-cols-1 gap-gap-xl tablet:grid-cols-2 desktop:auto-cols-fr desktop:grid-flow-col desktop:grid-cols-none">
      {toSummaryItems(summary).map(({ key, label, icon: Icon, value }) => (
        <div
          key={key}
          className="flex min-w-0 flex-col gap-gap-xxs rounded-l bg-layer-basement px-padding-l py-padding-m"
        >
          <dt className="flex items-center gap-gap-xs text-body2 font-medium text-neutral-subtle">
            <Icon aria-hidden className="size-4 shrink-0" />
            {label}
          </dt>
          <dd className="text-headline2 font-semibold break-keep text-neutral">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

export { OrganizationSummary }
