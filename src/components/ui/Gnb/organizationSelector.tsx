'use client'

import ChevronDownIcon from '@/assets/icons/chevronDown.svg'
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu/dropdownMenu'
import { SelectMenuContent } from '@/components/ui/SelectMenu/selectMenuContent'
import { usePointerFocus } from '@/hooks/usePointerFocus'

const ORGANIZATION_MENU_SIDE_OFFSET_PX = 8

type OrganizationOption = {
  id: string
  name: string
}

type OrganizationSelectorProps = {
  organizations: readonly OrganizationOption[]
  currentOrganizationId: string
}

function OrganizationSelector({ organizations, currentOrganizationId }: OrganizationSelectorProps) {
  const { isPointerFocus, markPointerFocus } = usePointerFocus()
  const currentName =
    organizations.find((organization) => organization.id === currentOrganizationId)?.name ?? ''
  const options = organizations.map(({ id, name }) => ({ value: id, label: name }))

  function handleOrganizationChange() {
    // TODO: 단체 전환 방식(URL 단체 ID 등) 결정 후 연결, 현재는 메뉴만 닫힘
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`${currentName} 단체 선택`}
        data-slot="organization-selector"
        data-pointer-focus={isPointerFocus ? '' : undefined}
        onPointerDown={markPointerFocus}
        className="flex h-10 max-w-48 min-w-0 shrink cursor-pointer items-center gap-gap-xs rounded-full border border-neutral-muted px-padding-xs text-neutral outline-none hover:bg-transparent-pressed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid data-pointer-focus:focus-visible:outline-none"
      >
        {/* TODO: 단체 이미지 경로, 호스트 확정 후 이름 첫 글자 대신 next/image로 교체 */}
        <span
          aria-hidden
          className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-caption1 font-semibold text-neutral-subtle"
        >
          {currentName.slice(0, 1)}
        </span>
        <span className="truncate text-label2 font-semibold">{currentName}</span>
        <ChevronDownIcon aria-hidden className="size-6 shrink-0" />
      </DropdownMenuTrigger>

      <SelectMenuContent
        groupLabel="내 단체"
        options={options}
        value={currentOrganizationId}
        onValueChange={handleOrganizationChange}
        sideOffset={ORGANIZATION_MENU_SIDE_OFFSET_PX}
        actions={
          // TODO: 새 단체 등록·대표 인수 화면 확정 후 연결
          <>
            <DropdownMenuItem>새 단체 등록</DropdownMenuItem>
            <DropdownMenuItem>기존 단체 대표 인수</DropdownMenuItem>
          </>
        }
      />
    </DropdownMenu>
  )
}

export { OrganizationSelector }
export type { OrganizationOption }
