import { useState, type MouseEvent } from 'react'
import { Pagination } from './pagination'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'UI/Pagination',
  component: Pagination,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof Pagination>

export default meta
// 필수 props를 render 안에서 직접 넘겨 args 타입 연결 제외
type Story = StoryObj

function getPageHref(page: number) {
  return `/?page=${page}` as const
}

export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-gap-l">
      <Pagination currentPage={1} totalPages={12} getPageHref={getPageHref} />
      <Pagination currentPage={6} totalPages={12} getPageHref={getPageHref} />
      <Pagination currentPage={12} totalPages={12} getPageHref={getPageHref} />
      <Pagination currentPage={2} totalPages={3} getPageHref={getPageHref} />
    </div>
  ),
}

const INTERACTIVE_TOTAL_PAGES = 12

// Storybook의 Next 라우터는 mock이라 링크 이동 대신 href의 page 값으로 상태 변경
function InteractivePagination() {
  const [currentPage, setCurrentPage] = useState(1)

  function handleLinkClickCapture(event: MouseEvent<HTMLDivElement>) {
    if (!(event.target instanceof Element)) {
      return
    }

    const link = event.target.closest('a')
    if (!link) {
      return
    }

    event.preventDefault()
    setCurrentPage(Number(new URL(link.href).searchParams.get('page')))
  }

  return (
    <div className="flex flex-col items-center gap-gap-m" onClickCapture={handleLinkClickCapture}>
      <Pagination
        currentPage={currentPage}
        totalPages={INTERACTIVE_TOTAL_PAGES}
        getPageHref={getPageHref}
      />
      <p className="text-label1 text-neutral-subtle">
        {currentPage} / {INTERACTIVE_TOTAL_PAGES}페이지
      </p>
    </div>
  )
}

export const Interactive: Story = {
  render: () => <InteractivePagination />,
}
