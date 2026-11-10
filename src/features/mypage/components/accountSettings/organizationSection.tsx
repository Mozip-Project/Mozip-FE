import PlusIcon from '@/assets/icons/plus.svg'
import RefreshIcon from '@/assets/icons/refresh.svg'
import { Badge } from '@/components/ui/Badge/badge'
import { Button } from '@/components/ui/Button/button'

type AffiliatedOrganization = {
  id: string
  name: string
  roleLabel: string
  teamName: string
}

type OrganizationSectionProps = {
  organizations: AffiliatedOrganization[]
}

function OrganizationSection({ organizations }: OrganizationSectionProps) {
  return (
    <section className="flex flex-col gap-gap-l py-padding-m">
      <h2 className="text-headline1 font-semibold text-neutral">소속 단체</h2>
      <ul className="flex flex-col gap-gap-l">
        {organizations.map((organization) => (
          <li key={organization.id} className="flex items-center gap-gap-m">
            {/* TODO: 단체 이미지 경로, 호스트 확정 후 이름 첫 글자 대신 next/image로 교체 */}
            <span
              aria-hidden
              className="flex size-11.5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-body2 font-semibold text-neutral-subtle"
            >
              {organization.name.slice(0, 1)}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-gap-xs">
              <div className="flex min-w-0 items-center gap-gap-s">
                <p className="min-w-0 truncate text-body2 font-semibold text-neutral">
                  {organization.name}
                </p>
                <Badge tone="brand" variant="weak">
                  {organization.roleLabel}
                </Badge>
              </div>
              <p className="truncate text-label2 text-neutral-subtle">{organization.teamName}</p>
            </div>
          </li>
        ))}
      </ul>
      <hr className="border-neutral-subtle" />
      {/* TODO: 새 단체 등록, 기존 단체 대표 인수 화면 확정 후 연결 */}
      <div className="flex flex-wrap gap-gap-s">
        <Button variant="tertiary" size="s">
          <PlusIcon aria-hidden />새 단체 등록
        </Button>
        <Button variant="tertiary" size="s">
          <RefreshIcon aria-hidden />
          기존 단체 대표 인수
        </Button>
      </div>
    </section>
  )
}

export { OrganizationSection }
export type { AffiliatedOrganization }
