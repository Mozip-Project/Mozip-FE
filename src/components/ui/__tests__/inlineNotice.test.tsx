import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { InlineNotice, InlineNoticeAction } from '@/components/ui/InlineNotice/inlineNotice'

describe('InlineNotice', () => {
  it('제목과 안내 문구를 함께 표시', () => {
    render(
      <InlineNotice tone="critical" title="전달 실패">
        메일 주소를 확인해 주세요
      </InlineNotice>,
    )

    expect(screen.getByText('전달 실패')).toBeInTheDocument()
    expect(screen.getByText('메일 주소를 확인해 주세요')).toBeInTheDocument()
  })

  it('액션 버튼 클릭 시 핸들러 호출', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(
      <InlineNotice
        tone="warning"
        action={<InlineNoticeAction onClick={handleClick}>바로가기</InlineNoticeAction>}
      >
        안내 문구
      </InlineNotice>,
    )

    await user.click(screen.getByRole('button', { name: '바로가기' }))

    expect(handleClick).toHaveBeenCalledOnce()
  })
})
