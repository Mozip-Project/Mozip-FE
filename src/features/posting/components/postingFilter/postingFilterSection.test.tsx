import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PostingFilterSection } from './postingFilterSection'

const OPTIONS = [
  { value: 'club', label: '동아리' },
  { value: 'society', label: '학회' },
  { value: 'studentCouncil', label: '학생회' },
] as const

type OptionValue = (typeof OPTIONS)[number]['value']

function renderSection(values: OptionValue[]) {
  const onValuesChange = vi.fn()

  render(
    <PostingFilterSection
      title="활동 유형"
      allLabel="유형 전체"
      options={OPTIONS}
      values={values}
      onValuesChange={onValuesChange}
    />,
  )

  return onValuesChange
}

describe('PostingFilterSection', () => {
  it('선택한 항목이 없으면 전체를 포함해 아무것도 체크하지 않음', () => {
    renderSection([])

    expect(screen.getByRole('checkbox', { name: '유형 전체' })).not.toBeChecked()
    expect(screen.getByRole('checkbox', { name: '동아리' })).not.toBeChecked()
  })

  it('전체를 체크하면 모든 항목을 옵션 순서대로 전달', async () => {
    const onValuesChange = renderSection(['society'])

    await userEvent.click(screen.getByRole('checkbox', { name: '유형 전체' }))

    expect(onValuesChange).toHaveBeenCalledWith(['club', 'society', 'studentCouncil'])
  })

  it('모두 선택된 상태에서 전체를 해제하면 모든 항목 해제', async () => {
    const onValuesChange = renderSection(['club', 'society', 'studentCouncil'])

    expect(screen.getByRole('checkbox', { name: '유형 전체' })).toBeChecked()

    await userEvent.click(screen.getByRole('checkbox', { name: '유형 전체' }))

    expect(onValuesChange).toHaveBeenCalledWith([])
  })

  it('모든 항목이 선택돼 있으면 전체도 체크, 하나라도 빠지면 전체 해제', () => {
    const { rerender } = render(
      <PostingFilterSection
        title="활동 유형"
        allLabel="유형 전체"
        options={OPTIONS}
        values={['club', 'society', 'studentCouncil']}
        onValuesChange={vi.fn()}
      />,
    )

    expect(screen.getByRole('checkbox', { name: '유형 전체' })).toBeChecked()

    rerender(
      <PostingFilterSection
        title="활동 유형"
        allLabel="유형 전체"
        options={OPTIONS}
        values={['club', 'society']}
        onValuesChange={vi.fn()}
      />,
    )

    expect(screen.getByRole('checkbox', { name: '유형 전체' })).not.toBeChecked()
  })

  it('항목을 체크하면 옵션 순서대로 전달', async () => {
    const onValuesChange = renderSection(['studentCouncil'])

    await userEvent.click(screen.getByRole('checkbox', { name: '동아리' }))

    expect(onValuesChange).toHaveBeenCalledWith(['club', 'studentCouncil'])
  })

  it('마지막 항목을 해제하면 빈 배열 전달', async () => {
    const onValuesChange = renderSection(['club'])

    await userEvent.click(screen.getByRole('checkbox', { name: '동아리' }))

    expect(onValuesChange).toHaveBeenCalledWith([])
  })
})
