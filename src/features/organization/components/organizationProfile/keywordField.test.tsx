import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { KeywordField } from './keywordField'

function ControlledKeywordField({ suggestions }: { suggestions: string[] }) {
  const [keywords, setKeywords] = useState<string[]>([])
  return <KeywordField value={keywords} onChange={setKeywords} suggestions={suggestions} />
}

function renderKeywordField(suggestions: string[] = []) {
  render(<ControlledKeywordField suggestions={suggestions} />)
  return screen.getByRole('combobox', { name: /검색 키워드/ })
}

describe('KeywordField', () => {
  it('Enter로 입력한 키워드를 칩으로 추가하고 입력창 비움', async () => {
    const user = userEvent.setup()
    const input = renderKeywordField()

    await user.type(input, 'UX{Enter}')

    expect(screen.getByText('UX')).toBeInTheDocument()
    expect(input).toHaveValue('')
  })

  it('한글 조합 중 Enter는 추가하지 않음', async () => {
    const user = userEvent.setup()
    const input = renderKeywordField()

    await user.type(input, '디자인')
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true })

    expect(screen.queryByRole('button', { name: '디자인 삭제' })).not.toBeInTheDocument()
    expect(input).toHaveValue('디자인')
  })

  it('메뉴에서 추천 키워드나 직접 추가를 눌러 추가', async () => {
    const user = userEvent.setup()
    const input = renderKeywordField(['프로토타입'])

    await user.type(input, '프로토')
    await user.click(screen.getByRole('option', { name: '프로토타입' }))
    await user.type(input, '피그마')
    await user.click(screen.getByRole('option', { name: '“피그마” 직접 추가' }))

    expect(screen.getByRole('button', { name: '프로토타입 삭제' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '피그마 삭제' })).toBeInTheDocument()
  })

  it('방향키로 고른 추천 키워드를 Enter로 추가', async () => {
    const user = userEvent.setup()
    const input = renderKeywordField(['프로토타이핑', '프로토타입'])

    await user.type(input, '프로토{ArrowDown}{ArrowDown}{Enter}')

    expect(screen.getByRole('button', { name: '프로토타입 삭제' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '프로토 삭제' })).not.toBeInTheDocument()
  })

  it('Esc로 메뉴를 닫은 뒤에도 Enter로 추가', async () => {
    const user = userEvent.setup()
    const input = renderKeywordField()

    await user.type(input, 'UX{Escape}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()

    await user.keyboard('{Enter}')

    expect(screen.getByRole('button', { name: 'UX 삭제' })).toBeInTheDocument()
  })

  it('삭제 버튼으로 키워드 제거', async () => {
    const user = userEvent.setup()
    const input = renderKeywordField()

    await user.type(input, 'UX{Enter}')
    await user.click(screen.getByRole('button', { name: 'UX 삭제' }))

    expect(screen.queryByText('UX')).not.toBeInTheDocument()
  })

  it('10개 등록 시 메뉴 대신 안내 문구 표시, 하나 삭제하면 안내 제거', async () => {
    const user = userEvent.setup()
    const input = renderKeywordField()

    for (let index = 1; index <= 10; index += 1) {
      await user.type(input, `키워드${index}{Enter}`)
    }
    await user.type(input, '추가')

    expect(screen.getByText('키워드는 최대 10개까지 등록 가능해요')).toBeInTheDocument()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '키워드1 삭제' }))

    expect(screen.queryByText('키워드는 최대 10개까지 등록 가능해요')).not.toBeInTheDocument()
  })
})
