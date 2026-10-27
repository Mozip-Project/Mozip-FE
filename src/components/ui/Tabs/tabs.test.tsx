import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'

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
})
