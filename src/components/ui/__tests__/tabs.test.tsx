import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs/tabs'

function renderTabs() {
  render(
    <Tabs defaultValue="all">
      <TabsList aria-label="지원자 상태">
        <TabsTrigger value="all" count={48}>
          전체
        </TabsTrigger>
        <TabsTrigger value="done" count={36}>
          평가 완료
        </TabsTrigger>
      </TabsList>
      <TabsContent value="all">전체 지원자</TabsContent>
      <TabsContent value="done">평가 완료 지원자</TabsContent>
    </Tabs>,
  )
}

describe('Tabs', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('라벨과 개수를 탭 이름으로 표시', () => {
    renderTabs()

    expect(screen.getByRole('tab', { name: '전체 48' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('전체 지원자')
  })

  it('클릭한 탭의 내용으로 전환', async () => {
    const user = userEvent.setup()
    renderTabs()

    await user.click(screen.getByRole('tab', { name: '평가 완료 36' }))

    expect(screen.getByRole('tab', { name: '평가 완료 36' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('tabpanel')).toHaveTextContent('평가 완료 지원자')
  })

  it('상태 점은 숨기고 label을 탭 이름에 포함', () => {
    render(
      <Tabs defaultValue="all">
        <TabsList aria-label="지원자 상태">
          <TabsTrigger value="all" count={48} status={{ tone: 'critical', label: '확인 필요' }}>
            전체
          </TabsTrigger>
        </TabsList>
      </Tabs>,
    )

    expect(screen.getByRole('tab', { name: '전체 48 확인 필요' })).toBeInTheDocument()
  })

  it('방향키로 다음 탭 이동 시 선택과 내용도 전환', async () => {
    const user = userEvent.setup()
    renderTabs()

    await user.click(screen.getByRole('tab', { name: '전체 48' }))
    await user.keyboard('{ArrowRight}')

    const nextTab = screen.getByRole('tab', { name: '평가 완료 36' })
    expect(nextTab).toHaveFocus()
    expect(nextTab).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('평가 완료 지원자')
  })

  it('끝에서 방향키를 누르면 비활성 탭을 건너뛰고 반대쪽 탭으로 순환', async () => {
    const user = userEvent.setup()
    render(
      <Tabs defaultValue="done">
        <TabsList aria-label="지원자 상태">
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="pending" disabled>
            평가 전
          </TabsTrigger>
          <TabsTrigger value="done">평가 완료</TabsTrigger>
        </TabsList>
      </Tabs>,
    )

    await user.click(screen.getByRole('tab', { name: '평가 완료' }))
    await user.keyboard('{ArrowRight}')

    expect(screen.getByRole('tab', { name: '전체' })).toHaveFocus()

    await user.keyboard('{ArrowRight}')

    expect(screen.getByRole('tab', { name: '평가 완료' })).toHaveFocus()
  })

  // 화면 위에 고정된 탭바에서 focus 시 html scroll-padding 때문에 페이지가 위로 밀리는 문제 방지
  it('클릭과 방향키 이동 모두 스크롤 없이 focus', async () => {
    const user = userEvent.setup()
    const focusSpy = vi.spyOn(HTMLElement.prototype, 'focus')
    renderTabs()

    await user.click(screen.getByRole('tab', { name: '전체 48' }))
    await user.keyboard('{ArrowRight}')

    expect(focusSpy).toHaveBeenCalledTimes(2)
    expect(focusSpy).toHaveBeenNthCalledWith(1, { preventScroll: true })
    expect(focusSpy).toHaveBeenNthCalledWith(2, { preventScroll: true })
  })

  it('focus가 남은 미선택 탭을 다시 누르면 선택', async () => {
    const user = userEvent.setup()
    const handleValueChange = vi.fn()
    const renderControlledTabs = (value: string) => (
      <Tabs value={value} onValueChange={handleValueChange}>
        <TabsList aria-label="지원자 상태">
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="done">평가 완료</TabsTrigger>
        </TabsList>
      </Tabs>
    )
    const { rerender } = render(renderControlledTabs('all'))

    await user.click(screen.getByRole('tab', { name: '평가 완료' }))
    rerender(renderControlledTabs('done'))
    // 뒤로 가기처럼 바깥에서 값만 되돌아간 경우
    rerender(renderControlledTabs('all'))
    handleValueChange.mockClear()

    await user.click(screen.getByRole('tab', { name: '평가 완료' }))

    expect(handleValueChange).toHaveBeenCalledWith('done')
  })

  it('개수 확인 중(null)이면 - 표시, 접근 가능한 이름에서는 제외', () => {
    render(
      <Tabs defaultValue="all">
        <TabsList aria-label="지원자 상태">
          <TabsTrigger value="all" count={null}>
            전체
          </TabsTrigger>
        </TabsList>
      </Tabs>,
    )

    const tab = screen.getByRole('tab', { name: '전체' })

    expect(tab).toHaveTextContent('전체 -')
  })
})
