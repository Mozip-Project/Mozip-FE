import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AttachmentItem } from '@/components/ui/AttachmentItem/attachmentItem'

describe('AttachmentItem', () => {
  it('파일은 같은 탭에서 다운로드', () => {
    render(
      <AttachmentItem
        type="file"
        name="포트폴리오.pdf"
        meta="PDF · 4.2MB"
        href="/files/portfolio.pdf"
      />,
    )

    const link = screen.getByRole('link', { name: '포트폴리오.pdf PDF · 4.2MB 다운로드' })
    expect(link).toHaveAttribute('download', '포트폴리오.pdf')
    expect(link).not.toHaveAttribute('target')
  })

  it('링크는 새 탭에서 열기', () => {
    render(
      <AttachmentItem
        type="link"
        name="포트폴리오 사이트"
        meta="example.com"
        href="https://example.com"
      />,
    )

    const link = screen.getByRole('link', {
      name: '포트폴리오 사이트 example.com 새 탭에서 열기',
    })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(link).not.toHaveAttribute('download')
  })
})
