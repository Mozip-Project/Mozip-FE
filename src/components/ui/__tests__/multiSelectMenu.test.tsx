import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MultiSelectMenu } from '@/components/ui/SelectMenu/multiSelectMenu'

const POSITION_OPTIONS = [
  { value: 'design', label: '디자인' },
  { value: 'development', label: '개발' },
] as const

type PositionValue = (typeof POSITION_OPTIONS)[number]['value']

const MIN_SELECTION_MESSAGE = '포지션을 1개 이상 선택해 주세요'

function MultiSelectMenuHarness({ initialValues }: { initialValues: PositionValue[] }) {
  const [positions, setPositions] = useState(initialValues)

  return (
    <MultiSelectMenu
      label="포지션"
      options={POSITION_OPTIONS}
      values={positions}
      onValuesChange={setPositions}
      minSelectionMessage={MIN_SELECTION_MESSAGE}
    />
  )
}

// 초기화 버튼과 구분
function getMenuTrigger() {
  return screen.getByRole('button', { expanded: false })
}

async function openMenu(initialValues: PositionValue[]) {
  const user = userEvent.setup()
  render(<MultiSelectMenuHarness initialValues={initialValues} />)
  await user.click(getMenuTrigger())
  return user
}

function mockReducedMotion(isReduced: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: isReduced })),
  )
}

describe('MultiSelectMenu', () => {
  const animate = vi.fn()

  beforeEach(() => {
    animate.mockClear()
    // jsdom 미지원
    Element.prototype.animate = animate
    mockReducedMotion(false)
  })

  afterEach(() => {
    // @ts-expect-error jsdom 기본값(미정의)으로 복구
    delete Element.prototype.animate
    vi.unstubAllGlobals()
  })

  it('마지막 선택 해제 시 선택 유지, 흔들림과 오류 문구 표시', async () => {
    const user = await openMenu(['design'])

    await user.click(screen.getByRole('menuitemcheckbox', { name: '디자인' }))

    expect(screen.getByRole('menuitemcheckbox', { name: '디자인' })).toBeChecked()
    expect(screen.getByRole('status')).toHaveTextContent(MIN_SELECTION_MESSAGE)
    expect(screen.getByRole('menu')).toHaveAccessibleDescription(MIN_SELECTION_MESSAGE)
    expect(animate).toHaveBeenCalledTimes(1)
  })

  it('오류 노출 중 다시 해제하면 다시 흔들림', async () => {
    const user = await openMenu(['design'])
    const lastOption = screen.getByRole('menuitemcheckbox', { name: '디자인' })

    await user.click(lastOption)
    await user.click(lastOption)

    expect(animate).toHaveBeenCalledTimes(2)
    expect(screen.getByRole('status')).toHaveTextContent(MIN_SELECTION_MESSAGE)
  })

  it('전체 해제도 막고 흔들림', async () => {
    const user = await openMenu(['design', 'development'])

    await user.click(screen.getByRole('menuitemcheckbox', { name: '전체' }))

    expect(screen.getByRole('menuitemcheckbox', { name: '전체' })).toBeChecked()
    expect(screen.getByRole('status')).toHaveTextContent(MIN_SELECTION_MESSAGE)
    expect(animate).toHaveBeenCalledTimes(1)
  })

  it('다른 옵션을 선택하면 오류 문구 숨김', async () => {
    const user = await openMenu(['design'])

    await user.click(screen.getByRole('menuitemcheckbox', { name: '디자인' }))
    await user.click(screen.getByRole('menuitemcheckbox', { name: '개발' }))

    expect(screen.getByRole('status')).toBeEmptyDOMElement()
    expect(screen.getByRole('menu')).not.toHaveAttribute('aria-describedby')
  })

  it('메뉴를 닫았다 열면 오류 문구 숨김', async () => {
    const user = await openMenu(['design'])

    await user.click(screen.getByRole('menuitemcheckbox', { name: '디자인' }))
    await user.keyboard('{Escape}')
    await user.click(getMenuTrigger())

    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })

  it('필터가 적용되면 초기화 버튼 표시, 누르면 전체 선택으로 되돌리고 트리거로 focus 이동', async () => {
    const user = userEvent.setup()
    render(<MultiSelectMenuHarness initialValues={['design']} />)

    await user.click(screen.getByRole('button', { name: '포지션 필터 초기화' }))

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '포지션 필터 초기화' })).not.toBeInTheDocument()
    const trigger = getMenuTrigger()
    expect(trigger).toHaveTextContent('포지션 전체')
    expect(trigger).toHaveFocus()
  })

  it('키보드로 초기화 버튼에 이동해 Enter로 초기화', async () => {
    const user = userEvent.setup()
    render(<MultiSelectMenuHarness initialValues={['design']} />)

    await user.tab()
    await user.tab()
    expect(screen.getByRole('button', { name: '포지션 필터 초기화' })).toHaveFocus()

    await user.keyboard('{Enter}')

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(getMenuTrigger()).toHaveTextContent('포지션 전체')
    expect(getMenuTrigger()).toHaveFocus()
  })

  it('전체 선택 상태에서는 초기화 버튼 미표시', () => {
    render(<MultiSelectMenuHarness initialValues={['design', 'development']} />)

    expect(screen.queryByRole('button', { name: '포지션 필터 초기화' })).not.toBeInTheDocument()
  })

  it('모션 감소 설정이면 흔들림 없이 오류 문구만 표시', async () => {
    mockReducedMotion(true)
    const user = await openMenu(['design'])

    await user.click(screen.getByRole('menuitemcheckbox', { name: '디자인' }))

    expect(animate).not.toHaveBeenCalled()
    expect(screen.getByRole('status')).toHaveTextContent(MIN_SELECTION_MESSAGE)
  })
})
