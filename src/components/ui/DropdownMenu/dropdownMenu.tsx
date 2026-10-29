'use client'

import { DropdownMenu as DropdownMenuPrimitive } from 'radix-ui'
import CheckIcon from '@/assets/icons/check.svg'
import { CheckboxMark } from '@/components/ui/Checkbox/checkboxMark'
import { cn } from '@/lib/utils'
import type { ComponentProps } from 'react'

function DropdownMenu(props: ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuTrigger(props: ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return <DropdownMenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />
}

// 드롭다운 공통 열림 간격
const MENU_SIDE_OFFSET_PX = 16

function DropdownMenuContent({
  className,
  align = 'start',
  sideOffset = MENU_SIDE_OFFSET_PX,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        align={align}
        className={cn(
          'z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-48 origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-l border border-neutral-subtle bg-layer-floating shadow-floating',
          'data-[state=closed]:overflow-hidden',
          // 모션 감소 설정 사용자에게는 애니메이션 미적용
          'data-[state=open]:duration-150 data-[state=open]:ease-out data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-1 motion-safe:data-[state=open]:animate-in',
          'data-[state=closed]:duration-100 data-[state=closed]:ease-in data-[state=closed]:fade-out-0 motion-safe:data-[state=closed]:animate-out',
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

function DropdownMenuGroup(props: ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
}

function DropdownMenuItem({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Item>) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      className={cn(
        'relative flex h-10 cursor-pointer items-center gap-gap-s rounded-m px-padding-s text-label1 font-medium text-neutral outline-none select-none',
        'focus:bg-layer-floating-pressed',
        'data-disabled:pointer-events-none data-disabled:text-disabled',
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
        className,
      )}
      {...props}
    />
  )
}

function DropdownMenuCheckboxItem({
  className,
  children,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        'relative flex h-10 cursor-pointer items-center gap-gap-s rounded-m px-padding-s text-label1 font-medium text-neutral outline-none select-none',
        'focus:bg-neutral-weak',
        'data-disabled:pointer-events-none data-disabled:text-disabled',
        className,
      )}
      {...props}
    >
      <CheckboxMark />
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
}

function DropdownMenuRadioGroup(props: ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return <DropdownMenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        'relative flex h-10 cursor-pointer items-center gap-gap-s rounded-m px-padding-s text-label1 font-medium text-neutral outline-none select-none',
        'focus:bg-neutral-weak',
        'data-[state=checked]:font-semibold',
        'data-disabled:pointer-events-none data-disabled:text-disabled',
        className,
      )}
      {...props}
    >
      {children}
      <DropdownMenuPrimitive.ItemIndicator
        data-slot="dropdown-menu-radio-item-indicator"
        className="ml-auto flex shrink-0"
      >
        <CheckIcon aria-hidden className="size-4 text-neutral-muted" />
      </DropdownMenuPrimitive.ItemIndicator>
    </DropdownMenuPrimitive.RadioItem>
  )
}

function DropdownMenuLabel({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Label>) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      className={cn(
        'px-padding-s py-padding-xxs text-caption1 font-medium text-neutral-subtle',
        className,
      )}
      {...props}
    />
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn('border-t border-neutral-subtle', className)}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
}
