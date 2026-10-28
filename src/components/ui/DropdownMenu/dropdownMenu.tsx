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

function DropdownMenuContent({
  className,
  align = 'start',
  sideOffset = 4,
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
          'duration-100 data-[state=closed]:overflow-hidden',
          'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          'motion-reduce:animate-none',
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

// TODO: Figma MultiSelectOption 값 반영 (현재 스크린샷 기준 임시값)
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
        'focus:bg-layer-floating-pressed',
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

// TODO: Figma SelectMenu 값 반영 (현재 스크린샷 기준 임시값)
function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        'relative flex h-10 cursor-pointer items-center rounded-m pr-10 pl-padding-s text-label1 font-normal text-neutral-muted outline-none select-none',
        'focus:bg-layer-floating-pressed',
        'data-[state=checked]:font-semibold data-[state=checked]:text-neutral',
        'data-disabled:pointer-events-none data-disabled:text-disabled',
        className,
      )}
      {...props}
    >
      <span
        data-slot="dropdown-menu-radio-item-indicator"
        className="pointer-events-none absolute right-padding-s flex items-center justify-center text-brand"
      >
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon aria-hidden className="size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
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
        'px-padding-s py-padding-xs text-caption1 font-medium text-neutral-subtle',
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
