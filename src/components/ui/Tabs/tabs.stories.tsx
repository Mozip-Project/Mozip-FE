import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'UI/Tabs',
  component: Tabs,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="all">
      <TabsList aria-label="지원자 상태">
        <TabsTrigger value="all" count={48}>
          전체
        </TabsTrigger>
        <TabsTrigger value="pending" count={12}>
          평가 전
        </TabsTrigger>
        <TabsTrigger value="done" count={36}>
          평가 완료
        </TabsTrigger>
      </TabsList>
      <TabsContent value="all" className="pt-padding-m text-body2">
        전체 지원자
      </TabsContent>
      <TabsContent value="pending" className="pt-padding-m text-body2">
        평가 전 지원자
      </TabsContent>
      <TabsContent value="done" className="pt-padding-m text-body2">
        평가 완료 지원자
      </TabsContent>
    </Tabs>
  ),
}

// status label은 Figma 미정의라 예시 문구 사용
const STATUS_EXAMPLES = [
  { tone: 'positive', label: '정상' },
  { tone: 'critical', label: '확인 필요' },
] as const

export const WithStatus: Story = {
  render: () => (
    <div className="flex">
      {STATUS_EXAMPLES.map((status) => (
        <Tabs key={status.tone} defaultValue="selected">
          <TabsList aria-label={`${status.label} 상태 예시`}>
            <TabsTrigger value="default" count={48} status={status}>
              전체
            </TabsTrigger>
            <TabsTrigger value="selected" count={48} status={status}>
              전체
            </TabsTrigger>
          </TabsList>
        </Tabs>
      ))}
    </div>
  ),
}
