import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AttachmentCard } from '@/components/ui/AttachmentCard/attachmentCard'

describe('AttachmentCard', () => {
  it('첨부 항목을 제목으로 묶은 목록으로 표시', () => {
    render(
      <AttachmentCard
        title="포트폴리오"
        items={[
          { type: 'file', name: '포트폴리오.pdf', meta: 'PDF · 4.2MB', href: '/files/a.pdf' },
          { type: 'link', name: 'example.com', meta: '외부 링크', href: 'https://example.com' },
        ]}
        emptyMessage="첨부한 포트폴리오가 없어요"
      />,
    )

    const card = screen.getByRole('region', { name: '포트폴리오' })
    expect(within(card).getAllByRole('listitem')).toHaveLength(2)
    expect(within(card).queryByText('첨부한 포트폴리오가 없어요')).not.toBeInTheDocument()
  })

  it('항목이 없으면 빈 안내 문구 표시', () => {
    render(
      <AttachmentCard title="포트폴리오" items={[]} emptyMessage="첨부한 포트폴리오가 없어요" />,
    )

    expect(screen.getByText('첨부한 포트폴리오가 없어요')).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })
})
