'use client'

import ChevronDownIcon from '@/assets/icons/chevronDown.svg'
import { Button } from '@/components/ui/Button/button'
import { DropdownMenuTrigger } from '@/components/ui/DropdownMenu/dropdownMenu'
import { usePointerFocus } from '@/hooks/usePointerFocus'

type SelectMenuTriggerProps = {
  label: string
  children: string
}

function SelectMenuTrigger({ label, children }: SelectMenuTriggerProps) {
  const { isPointerFocus, markPointerFocus } = usePointerFocus()

  return (
    <DropdownMenuTrigger asChild>
      <Button
        variant="tertiary"
        size="s"
        data-pointer-focus={isPointerFocus ? '' : undefined}
        onPointerDown={markPointerFocus}
        className="text-neutral-subtle data-pointer-focus:focus-visible:outline-none"
      >
        <span className="sr-only">{label} </span>
        {children}
        <ChevronDownIcon aria-hidden className="text-neutral-muted" />
      </Button>
    </DropdownMenuTrigger>
  )
}

export { SelectMenuTrigger }
