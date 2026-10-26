import ChevronDownIcon from '@/assets/icons/chevronDown.svg'

type OrganizationSelectorProps = {
  name: string
}

// TODO: 단체 전환 패널 디자인 확정 후 연결
function OrganizationSelector({ name }: OrganizationSelectorProps) {
  return (
    <button
      type="button"
      aria-label={`${name} 단체 선택`}
      data-slot="organization-selector"
      className="flex h-10 max-w-48 min-w-0 shrink cursor-pointer items-center gap-gap-xs rounded-full border border-neutral-muted px-padding-xs text-neutral outline-none hover:bg-transparent-pressed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid"
    >
      {/* TODO: 단체 이미지 경로, 호스트 확정 후 이름 첫 글자 대신 next/image로 교체 */}
      <span
        aria-hidden
        className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-caption1 font-semibold text-neutral-subtle"
      >
        {name.slice(0, 1)}
      </span>
      <span className="truncate text-label2 font-semibold">{name}</span>
      <ChevronDownIcon aria-hidden className="size-6 shrink-0" />
    </button>
  )
}

export { OrganizationSelector }
