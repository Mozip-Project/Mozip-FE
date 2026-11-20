import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Activity } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Button } from '@/components/ui/Button/button'
import { PostingStartDialog } from './postingStartDialog'

const push = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

function DialogInPage({ mode }: { mode: 'visible' | 'hidden' }) {
  return (
    <Activity mode={mode}>
      <PostingStartDialog>
        <Button>새 공고 만들기</Button>
      </PostingStartDialog>
    </Activity>
  )
}

async function openDialog() {
  const user = userEvent.setup()
  render(
    <PostingStartDialog>
      <Button>새 공고 만들기</Button>
    </PostingStartDialog>,
  )
  await user.click(screen.getByRole('button', { name: '새 공고 만들기' }))
  return user
}

describe('PostingStartDialog', () => {
  beforeEach(() => {
    push.mockClear()
  })

  it('면접 여부를 고르기 전에는 다음 버튼 비활성', async () => {
    await openDialog()

    expect(screen.getByRole('dialog', { name: '새 공고를 만들어 볼까요?' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '다음' })).toBeDisabled()
  })

  it.each([
    ['면접을 봐요', '/manage/postings/new?interview=true'],
    ['면접을 보지 않아요', '/manage/postings/new?interview=false'],
  ])(
    '%s 선택 후 다음을 누르면 다이얼로그를 닫고 면접 여부를 담아 공고 작성으로 이동',
    async (option, path) => {
      const user = await openDialog()

      await user.click(screen.getByRole('radio', { name: new RegExp(option) }))
      expect(screen.getByRole('radio', { name: new RegExp(option) })).toBeChecked()

      await user.click(screen.getByRole('button', { name: '다음' }))
      expect(push).toHaveBeenCalledExactlyOnceWith(path)
      // 이동 후에도 남는 LNB에서 연 경우와 같은 상황
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    },
  )

  it('취소로 닫았다 다시 열면 선택 초기화', async () => {
    const user = await openDialog()

    await user.click(screen.getByRole('radio', { name: /면접을 봐요/ }))
    await user.click(screen.getByRole('button', { name: '취소' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '새 공고 만들기' }))
    expect(screen.getByRole('radio', { name: /면접을 봐요/ })).not.toBeChecked()
    expect(screen.getByRole('button', { name: '다음' })).toBeDisabled()
    expect(push).not.toHaveBeenCalled()
  })

  it('다음으로 이동해 페이지가 숨겨졌다 돌아오면 다이얼로그 닫힘과 선택 초기화', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<DialogInPage mode="visible" />)

    await user.click(screen.getByRole('button', { name: '새 공고 만들기' }))
    await user.click(screen.getByRole('radio', { name: /면접을 봐요/ }))
    await user.click(screen.getByRole('button', { name: '다음' }))

    rerender(<DialogInPage mode="hidden" />)
    rerender(<DialogInPage mode="visible" />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '새 공고 만들기' }))
    expect(screen.getByRole('radio', { name: /면접을 봐요/ })).not.toBeChecked()
  })
})
