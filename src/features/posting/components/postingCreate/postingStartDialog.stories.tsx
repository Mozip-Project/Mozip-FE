import { screen, userEvent } from 'storybook/test'
import { Button } from '@/components/ui/Button/button'
import { PostingStartDialog } from './postingStartDialog'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'Features/Posting/PostingStartDialog',
  component: PostingStartDialog,
  parameters: { layout: 'padded', nextjs: { appDirectory: true } },
  args: { children: <Button size="m">새 공고 만들기</Button> },
} satisfies Meta<typeof PostingStartDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Open: Story = {
  play: async () => {
    await userEvent.click(screen.getByRole('button', { name: '새 공고 만들기' }))
  },
}

export const Selected: Story = {
  play: async () => {
    await userEvent.click(screen.getByRole('button', { name: '새 공고 만들기' }))
    await userEvent.click(await screen.findByRole('radio', { name: /면접을 봐요/ }))
  },
}
