import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from './dropdownMenu'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'UI/DropdownMenu',
  component: DropdownMenu,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof DropdownMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Options: Story = {
  render: () => (
    <div className="h-80 p-padding-xl">
      <DropdownMenu defaultOpen modal={false}>
        <DropdownMenuTrigger>메뉴</DropdownMenuTrigger>
        <DropdownMenuContent className="flex w-60 flex-col gap-gap-xxs rounded-m border-neutral-muted p-padding-xs">
          <DropdownMenuRadioGroup value="selected" className="flex flex-col gap-gap-xxs">
            <DropdownMenuRadioItem value="default">옵션</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="selected">옵션</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuItem>옵션</DropdownMenuItem>
          <DropdownMenuItem variant="critical">삭제</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ),
}
