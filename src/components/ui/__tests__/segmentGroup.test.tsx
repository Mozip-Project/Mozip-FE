import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SegmentGroup } from '@/components/ui/SegmentGroup/segmentGroup'
import { SegmentOption } from '@/components/ui/SegmentGroup/segmentOption'

function renderSegmentGroup(props: { errorMessage?: string } = {}) {
  const onValueChange = vi.fn()
  render(
    <SegmentGroup aria-label="평가 결과" onValueChange={onValueChange} {...props}>
      <SegmentOption value="pass">합격</SegmentOption>
      <SegmentOption value="hold">보류</SegmentOption>
      <SegmentOption value="fail">불합격</SegmentOption>
    </SegmentGroup>,
  )
  return { onValueChange, group: screen.getByRole('radiogroup', { name: '평가 결과' }) }
}

// 평가 폼처럼 form 안에서 value를 밖에서 관리하는 경우(Radix가 form 안에서 클릭 전파 중단)
function FormSegmentGroup({ onValueChange }: { onValueChange: (value: string) => void }) {
  const [value, setValue] = useState('pass')

  return (
    <form>
      <SegmentGroup
        aria-label="평가 결과"
        value={value}
        onValueChange={(nextValue) => {
          setValue(nextValue)
          onValueChange(nextValue)
        }}
      >
        <SegmentOption value="pass">합격</SegmentOption>
        <SegmentOption value="hold">보류</SegmentOption>
      </SegmentGroup>
    </form>
  )
}

// jsdom 미지원, form 안에서 Radix 숨김 input이 사용
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe('SegmentGroup', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', ResizeObserverStub)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('옵션 클릭 시 하나만 선택', async () => {
    const user = userEvent.setup()
    const { onValueChange } = renderSegmentGroup()

    await user.click(screen.getByRole('radio', { name: '보류' }))

    expect(onValueChange).toHaveBeenCalledWith('hold')
    expect(screen.getByRole('radio', { name: '보류' })).toBeChecked()
    expect(screen.getByRole('radio', { name: '합격' })).not.toBeChecked()
  })

  it('선택된 옵션을 다시 누르면 빈 값으로 선택 해제', async () => {
    const user = userEvent.setup()
    const { onValueChange } = renderSegmentGroup()
    const holdOption = screen.getByRole('radio', { name: '보류' })

    await user.click(holdOption)
    await user.click(holdOption)

    expect(onValueChange).toHaveBeenLastCalledWith('')
    expect(holdOption).not.toBeChecked()
  })

  it('form 안에서 value를 밖에서 관리해도 다시 누르면 선택 해제', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<FormSegmentGroup onValueChange={onValueChange} />)
    const passOption = screen.getByRole('radio', { name: '합격' })
    expect(passOption).toBeChecked()

    await user.click(passOption)

    expect(onValueChange).toHaveBeenLastCalledWith('')
    expect(passOption).not.toBeChecked()
    expect(screen.getByRole('radio', { name: '보류' })).not.toBeChecked()
  })

  it('방향키로 다음 옵션 선택', async () => {
    const user = userEvent.setup()
    const { onValueChange } = renderSegmentGroup()

    await user.click(screen.getByRole('radio', { name: '합격' }))
    // Radix가 다음 tick에 focus를 옮겨 키 누름 상태 유지
    await user.keyboard('{ArrowRight>}')

    await waitFor(() => expect(onValueChange).toHaveBeenLastCalledWith('hold'))
    expect(screen.getByRole('radio', { name: '보류' })).toHaveFocus()
  })

  it('오류 문구를 그룹과 연결', () => {
    const { group } = renderSegmentGroup({ errorMessage: '옵션을 선택해 주세요' })

    expect(group).toHaveAttribute('aria-invalid', 'true')
    expect(group).toHaveAccessibleDescription('옵션을 선택해 주세요')
  })

  it('호출자 설명과 오류 문구를 함께 연결', () => {
    render(
      <>
        <p id="score-help">점수 기준 안내</p>
        <SegmentGroup
          aria-label="평가 결과"
          aria-describedby="score-help"
          aria-invalid={false}
          errorMessage="옵션을 선택해 주세요"
        >
          <SegmentOption value="pass">합격</SegmentOption>
        </SegmentGroup>
      </>,
    )
    const group = screen.getByRole('radiogroup', { name: '평가 결과' })

    expect(group).toHaveAttribute('aria-invalid', 'true')
    expect(group).toHaveAccessibleDescription('점수 기준 안내 옵션을 선택해 주세요')
  })

  it('오류가 없으면 invalid 표시 없음', () => {
    const { group } = renderSegmentGroup()

    expect(group).not.toHaveAttribute('aria-invalid')
    expect(group).not.toHaveAttribute('aria-describedby')
  })
})
