import { SearchField } from './searchField'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'UI/SearchField',
  component: SearchField,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof SearchField>

export default meta
// 필수 props를 render 안에서 직접 넘겨 args 타입 연결 제외
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-gap-l">
      <SearchField
        className="w-90"
        aria-label="단체 검색"
        placeholder="단체명 또는 키워드를 검색해 주세요"
      />
      <SearchField
        className="w-90"
        aria-label="단체 검색"
        placeholder="단체명 또는 키워드를 검색해 주세요"
        defaultValue="UXUX"
      />
    </div>
  ),
}
