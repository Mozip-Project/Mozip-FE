import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PostingContentEditor } from './postingContentEditor'

// jsdom 미지원, ProseMirror 커서 위치 계산용
const EMPTY_RECT = { x: 0, y: 0, top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 }

function renderEditor(value = '') {
  const handleChange = vi.fn()
  render(
    <>
      <h2 id="content-title">공고 내용</h2>
      <PostingContentEditor value={value} onChange={handleChange} labelledBy="content-title" />
    </>,
  )
  return handleChange
}

function getToolButton(name: string) {
  return screen.getByRole('button', { name })
}

describe('PostingContentEditor', () => {
  beforeEach(() => {
    Object.defineProperty(Range.prototype, 'getClientRects', {
      configurable: true,
      value: () => [],
    })
    Object.defineProperty(Range.prototype, 'getBoundingClientRect', {
      configurable: true,
      value: () => EMPTY_RECT,
    })
    Object.defineProperty(document, 'elementFromPoint', { configurable: true, value: () => null })
  })

  afterEach(() => {
    Reflect.deleteProperty(Range.prototype, 'getClientRects')
    Reflect.deleteProperty(Range.prototype, 'getBoundingClientRect')
    Reflect.deleteProperty(document, 'elementFromPoint')
  })

  it('공고 내용 이름의 입력칸과 비어 있을 때 안내 문구 표시', async () => {
    renderEditor()

    expect(await screen.findByRole('textbox', { name: '공고 내용' })).toBeInTheDocument()
    expect(screen.getByText('내용을 입력해 주세요')).toBeInTheDocument()
  })

  it.each(['목록', '제목'])('빈 입력칸에서 %s 버튼을 누르면 안내 문구 숨김', async (toolName) => {
    const user = userEvent.setup()
    const handleChange = renderEditor()
    await screen.findByRole('textbox', { name: '공고 내용' })

    await user.click(getToolButton(toolName))

    await waitFor(() => expect(screen.queryByText('내용을 입력해 주세요')).not.toBeInTheDocument())
    expect(handleChange).toHaveBeenLastCalledWith('')
  })

  it('누른 툴 버튼만 active, 제목과 목록은 서로 바뀜', async () => {
    const user = userEvent.setup()
    renderEditor()
    await screen.findByRole('textbox', { name: '공고 내용' })

    await user.click(getToolButton('제목'))
    await waitFor(() => expect(getToolButton('제목')).toHaveAttribute('aria-pressed', 'true'))
    expect(getToolButton('목록')).toHaveAttribute('aria-pressed', 'false')

    await user.click(getToolButton('목록'))
    await waitFor(() => expect(getToolButton('목록')).toHaveAttribute('aria-pressed', 'true'))
    expect(getToolButton('제목')).toHaveAttribute('aria-pressed', 'false')
  })

  it('저장된 내용의 서식에 맞춰 툴바 표시와 입력 시 HTML 전달', async () => {
    const user = userEvent.setup()
    const handleChange = renderEditor('<p><strong>UI/UX 디자인 동아리</strong></p>')
    await screen.findByRole('textbox', { name: '공고 내용' })

    expect(screen.queryByText('내용을 입력해 주세요')).not.toBeInTheDocument()
    await user.click(screen.getByRole('textbox', { name: '공고 내용' }))
    await user.keyboard('{Control>}a{/Control}')
    await user.click(getToolButton('기울임'))

    await waitFor(() => expect(getToolButton('기울임')).toHaveAttribute('aria-pressed', 'true'))
    expect(getToolButton('굵게')).toHaveAttribute('aria-pressed', 'true')
    expect(handleChange).toHaveBeenLastCalledWith(
      '<p><strong><em>UI/UX 디자인 동아리</em></strong></p>',
    )
  })
})
