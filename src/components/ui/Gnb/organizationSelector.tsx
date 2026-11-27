'use client'

import Image from 'next/image'
import { useState } from 'react'
import ChevronDownIcon from '@/assets/icons/chevronDown.svg'
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu/dropdownMenu'
import { SelectMenuContent } from '@/components/ui/SelectMenu/selectMenuContent'
import { usePointerFocus } from '@/hooks/usePointerFocus'

const ORGANIZATION_MENU_SIDE_OFFSET_PX = 8
const LOGO_SIZE_PX = 24

type OrganizationOption = {
  id: string
  name: string
  // 없거나 불러오지 못하면 이름 첫 글자 표시
  logoUrl?: string | null
}

type OrganizationSelectorProps = {
  organizations: readonly OrganizationOption[]
  currentOrganizationId: string
  onOrganizationChange: (organizationId: string) => void
  onCreateOrganization: () => void
  onTakeOverRepresentative: () => void
}

function OrganizationSelector({
  organizations,
  currentOrganizationId,
  onOrganizationChange,
  onCreateOrganization,
  onTakeOverRepresentative,
}: OrganizationSelectorProps) {
  const { isPointerFocus, markPointerFocus } = usePointerFocus()
  const currentOrganization = organizations.find(
    (organization) => organization.id === currentOrganizationId,
  )
  const currentName = currentOrganization?.name ?? ''
  // 단체를 바꾸면 다시 시도하도록 실패한 주소를 기억
  const [failedLogoUrl, setFailedLogoUrl] = useState<string | null>(null)
  const logoUrl = currentOrganization?.logoUrl
  const currentLogoUrl = logoUrl && logoUrl !== failedLogoUrl ? logoUrl : null
  const options = organizations.map(({ id, name }) => ({ value: id, label: name }))

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`${currentName} 단체 선택`}
        data-slot="organization-selector"
        data-pointer-focus={isPointerFocus ? '' : undefined}
        onPointerDown={markPointerFocus}
        className="flex h-10 max-w-48 min-w-0 shrink cursor-pointer items-center gap-gap-xs rounded-full border border-neutral-muted px-padding-xs text-neutral outline-none hover:bg-transparent-pressed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid data-pointer-focus:focus-visible:outline-none"
      >
        <span
          aria-hidden
          className="relative flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-caption1 font-semibold text-neutral-subtle"
        >
          {currentLogoUrl ? (
            <Image
              src={currentLogoUrl}
              alt=""
              fill
              sizes={`${LOGO_SIZE_PX}px`}
              className="object-cover"
              onError={() => setFailedLogoUrl(currentLogoUrl)}
            />
          ) : (
            currentName.slice(0, 1)
          )}
        </span>
        <span className="truncate text-label2 font-semibold">{currentName}</span>
        <ChevronDownIcon aria-hidden className="size-6 shrink-0" />
      </DropdownMenuTrigger>

      <SelectMenuContent
        groupLabel="내 단체"
        options={options}
        value={currentOrganizationId}
        onValueChange={onOrganizationChange}
        sideOffset={ORGANIZATION_MENU_SIDE_OFFSET_PX}
        actions={
          <>
            <DropdownMenuItem onSelect={onCreateOrganization}>새 단체 등록</DropdownMenuItem>
            <DropdownMenuItem onSelect={onTakeOverRepresentative}>
              기존 단체 대표 인수
            </DropdownMenuItem>
          </>
        }
      />
    </DropdownMenu>
  )
}

export { OrganizationSelector }
export type { OrganizationOption }
