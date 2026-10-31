'use client'

import ChevronDownIcon from '@/assets/icons/chevronDown.svg'
import { Button } from '@/components/ui/Button/button'
import { DropdownMenuTrigger } from '@/components/ui/DropdownMenu/dropdownMenu'
import { usePointerFocus } from '@/hooks/usePointerFocus'
import { cn } from '@/lib/utils'
import type { Ref } from 'react'

type SelectMenuTriggerProps = {
  label: string
  children: string
  // 화살표 자리만 비워 둠
  isChevronHidden?: boolean
  className?: string
  ref?: Ref<HTMLButtonElement>
}

function SelectMenuTrigger({
  label,
  children,
  isChevronHidden = false,
  className,
  ref,
}: SelectMenuTriggerProps) {
  const { isPointerFocus, markPointerFocus } = usePointerFocus()

  return (
    <DropdownMenuTrigger asChild>
      <Button
        ref={ref}
        variant="tertiary"
        size="s"
        data-pointer-focus={isPointerFocus ? '' : undefined}
        onPointerDown={markPointerFocus}
        className={cn(
          'text-neutral-subtle data-pointer-focus:focus-visible:outline-none',
          className,
        )}
      >
        <span className="sr-only">{label} </span>
        {children}
        {isChevronHidden ? (
          <span aria-hidden className="size-4 shrink-0" />
        ) : (
          <ChevronDownIcon aria-hidden className="text-neutral-muted" />
        )}
      </Button>
    </DropdownMenuTrigger>
  )
}

export { SelectMenuTrigger }
