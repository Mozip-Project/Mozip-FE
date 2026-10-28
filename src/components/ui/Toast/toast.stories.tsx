import { useState } from 'react'
import { Button } from '@/components/ui/Button/button'
import { Toast, ToastProvider, ToastViewport } from './toast'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'UI/Toast',
  component: Toast,
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta<typeof Toast>

export default meta
// 필수 props를 render 안에서 직접 넘겨 args 타입 연결 제외
type Story = StoryObj

const TITLE = '임시 저장했어요'
const DESCRIPTION = '모집 관리 > 작성 중에서 언제든 이어서 쓸 수 있어요'

// 디자인 확인용 고정 표시
export const Default: Story = {
  render: () => (
    <ToastProvider duration={Infinity}>
      <Toast open title={TITLE} description={DESCRIPTION} />
      <ToastViewport />
    </ToastProvider>
  ),
}

function ToastTrigger() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <ToastProvider>
      <div className="p-padding-m">
        <Button size="m" onClick={() => setIsOpen(true)}>
          임시 저장
        </Button>
      </div>
      <Toast open={isOpen} onOpenChange={setIsOpen} title={TITLE} description={DESCRIPTION} />
      <ToastViewport />
    </ToastProvider>
  )
}

export const Interactive: Story = {
  render: () => <ToastTrigger />,
}
