import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  EMPTY_POSTING_CREATE,
  type PostingCreateValues,
} from '@/features/posting/schemas/postingCreateValues'
import { PostingMethodStep } from './postingMethodStep'

// jsdom 미지원
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

function MethodStepHarness() {
  const { control } = useForm<PostingCreateValues>({ defaultValues: EMPTY_POSTING_CREATE })
  return <PostingMethodStep control={control} />
}

async function addPosition(user: ReturnType<typeof userEvent.setup>, name: string) {
  await user.click(screen.getByRole('button', { name: '포지션 추가' }))
  const dialog = await screen.findByRole('dialog', { name: '추가할 포지션을 입력해 주세요' })
  await user.type(within(dialog).getByRole('textbox', { name: '포지션' }), `${name}{Enter}`)
}

describe('PostingMethodStep', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', ResizeObserverStub)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('포지션별 모집을 고르면 모집 포지션 안내와 빈 상태 표시, 통합 모집이면 숨김', async () => {
    const user = userEvent.setup()
    render(<MethodStepHarness />)

    expect(screen.queryByRole('heading', { name: '모집 포지션' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: '포지션별 모집' }))
    expect(screen.getByRole('heading', { name: '모집 포지션' })).toBeInTheDocument()
    expect(screen.getByText('팀 설정에 등록된 포지션이 없어요')).toBeInTheDocument()
    expect(screen.getByText('추가한 포지션이 없어요')).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: '통합 모집' }))
    expect(screen.queryByRole('heading', { name: '모집 포지션' })).not.toBeInTheDocument()
  })

  it('포지션 이름을 입력해야 추가하기 활성, 공백만 있으면 비활성', async () => {
    const user = userEvent.setup()
    render(<MethodStepHarness />)
    await user.click(screen.getByRole('radio', { name: '포지션별 모집' }))

    await user.click(screen.getByRole('button', { name: '포지션 추가' }))
    const dialog = await screen.findByRole('dialog', { name: '추가할 포지션을 입력해 주세요' })
    const addButton = within(dialog).getByRole('button', { name: '추가하기' })
    expect(addButton).toBeDisabled()

    await user.type(within(dialog).getByRole('textbox', { name: '포지션' }), '   ')
    expect(addButton).toBeDisabled()

    await user.type(within(dialog).getByRole('textbox', { name: '포지션' }), '디자인팀')
    expect(addButton).toBeEnabled()
  })

  it('이미 추가한 포지션 이름을 입력하면 추가하기 비활성, 입력칸 아래 안내', async () => {
    const user = userEvent.setup()
    render(<MethodStepHarness />)
    await user.click(screen.getByRole('radio', { name: '포지션별 모집' }))
    await addPosition(user, '디자인팀')

    await user.click(screen.getByRole('button', { name: '포지션 추가' }))
    const dialog = await screen.findByRole('dialog', { name: '추가할 포지션을 입력해 주세요' })
    const input = within(dialog).getByRole('textbox', { name: '포지션' })
    await user.type(input, ' 디자인팀')

    expect(within(dialog).getByRole('button', { name: '추가하기' })).toBeDisabled()
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription('이미 추가한 포지션이에요')
  })

  it('추가한 포지션이 목록에 쌓이고 삭제하면 빈 상태로 돌아감', async () => {
    const user = userEvent.setup()
    render(<MethodStepHarness />)
    await user.click(screen.getByRole('radio', { name: '포지션별 모집' }))

    await addPosition(user, '디자인팀')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await addPosition(user, '  개발팀  ')

    const list = screen.getByRole('list', { name: '모집 포지션' })
    expect(
      within(list)
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual(['디자인팀', '개발팀'])
    expect(screen.queryByText('추가한 포지션이 없어요')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '디자인팀 삭제' }))
    await user.click(screen.getByRole('button', { name: '개발팀 삭제' }))
    expect(screen.getByText('추가한 포지션이 없어요')).toBeInTheDocument()
  })
})
