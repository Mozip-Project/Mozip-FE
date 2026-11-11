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
  it('선택한 항목이 없으면 전체를 체크 상태로 표시', () => {
    renderSection([])

    expect(screen.getByRole('checkbox', { name: '유형 전체' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: '동아리' })).not.toBeChecked()
  })

  it('항목을 체크하면 전체가 빠지고 옵션 순서대로 전달', async () => {
    const onValuesChange = renderSection(['studentCouncil'])

    await userEvent.click(screen.getByRole('checkbox', { name: '동아리' }))

    expect(screen.getByRole('checkbox', { name: '유형 전체' })).not.toBeChecked()
    expect(onValuesChange).toHaveBeenCalledWith(['club', 'studentCouncil'])
  })

  it('마지막 항목을 해제하면 빈 배열(전체) 전달', async () => {
    const onValuesChange = renderSection(['club'])

    await userEvent.click(screen.getByRole('checkbox', { name: '동아리' }))

    expect(onValuesChange).toHaveBeenCalledWith([])
  })

  it('전체를 체크하면 선택한 항목을 모두 해제', async () => {
    const onValuesChange = renderSection(['club', 'society'])

    await userEvent.click(screen.getByRole('checkbox', { name: '유형 전체' }))

    expect(onValuesChange).toHaveBeenCalledWith([])
  })

  it('이미 전체인 상태에서 전체를 다시 누르면 변경 없음', async () => {
    const onValuesChange = renderSection([])

    await userEvent.click(screen.getByRole('checkbox', { name: '유형 전체' }))

    expect(onValuesChange).not.toHaveBeenCalled()
  })
})
