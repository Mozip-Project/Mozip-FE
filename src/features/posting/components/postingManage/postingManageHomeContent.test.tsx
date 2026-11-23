import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { resetManagedPostings } from '@/features/posting/mocks/managedPostingHandlers'
import { graphqlApi } from '@/mocks/graphqlApi'
import { server } from '@/mocks/server'
import { ToastProvider } from '@/providers/toastProvider'
import { PostingManageHomeContent } from './postingManageHomeContent'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

function renderHome(savedOrganizationId?: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <PostingManageHomeContent savedOrganizationId={savedOrganizationId} />
      </ToastProvider>
    </QueryClientProvider>,
  )
}

beforeAll(() => {
  vi.stubEnv('NEXT_PUBLIC_GRAPHQL_ENDPOINT', 'https://api.test/graphql')
})

afterEach(() => {
  resetManagedPostings()
})

afterAll(() => {
  vi.unstubAllEnvs()
})

describe('PostingManageHomeContent', () => {
  it('현재 단체명과 진행 중 공고, 서버 기준 탭 숫자 표시', async () => {
    renderHome()

    expect(await screen.findByRole('heading', { level: 1, name: 'UXUX' })).toBeInTheDocument()
    expect(
      await screen.findByRole('heading', { name: 'UXUX 14기 운영진 모집' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'UXUX 14기 신입 부원 모집' })).toBeInTheDocument()
    expect(await screen.findByRole('tab', { name: '진행 중 2' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '작성 중 1' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '종료된 공고 1' })).toBeInTheDocument()
  })

  it('최신순 순위와 UP 버튼은 지원 접수 중인 공고에만 표시', async () => {
    renderHome()

    expect(
      await screen.findByRole('button', { name: 'UXUX 14기 운영진 모집 UP하기' }),
    ).toBeInTheDocument()
    expect(screen.getByText('최신순 18위')).toBeInTheDocument()
    // 서류 평가 중인 공고의 서버 순위(24위)는 표시하지 않음
    expect(screen.queryByText('최신순 24위')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'UXUX 14기 신입 부원 모집 UP하기' }),
    ).not.toBeInTheDocument()
  })

  it('UP하면 잔여 1회를 쓰고 순위가 1위로 바뀌며, 잔여가 없으면 팝업의 사용 버튼 비활성', async () => {
    const user = userEvent.setup()
    renderHome()

    await user.click(await screen.findByRole('button', { name: 'UXUX 14기 운영진 모집 UP하기' }))
    const dialog = await screen.findByRole('dialog')
    const useButton = within(dialog).getByRole('button', { name: '1회 사용하기' })
    await waitFor(() => expect(useButton).toBeEnabled())
    await user.click(useButton)

    expect(await screen.findByText('공고 UP을 완료했어요')).toBeInTheDocument()
    expect(await screen.findByText('최신순 1위')).toBeInTheDocument()
    // 잔여가 0회면 팝업은 열리되 사용 버튼만 비활성
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'UXUX 14기 운영진 모집 UP하기' }))
    const zeroDialog = await screen.findByRole('dialog')
    expect(within(zeroDialog).getByRole('button', { name: '1회 사용하기' })).toBeDisabled()
    // 정확히 '0회'인 요소만 찾아 '0회 -> 0회'가 아님을 확인
    expect(within(zeroDialog).getByText('0회')).toBeInTheDocument()
  })

  it('작성 중 공고는 일정 미정으로 표시하고 삭제하면 빈 상태와 탭 숫자 반영', async () => {
    const user = userEvent.setup()
    renderHome()

    await user.click(await screen.findByRole('tab', { name: /작성 중/ }))
    expect(
      await screen.findByRole('heading', { name: 'UXUX 15기 운영진 추가 모집' }),
    ).toBeInTheDocument()
    expect(screen.getAllByText('일정 미정')).toHaveLength(2)

    await user.click(screen.getByRole('button', { name: 'UXUX 15기 운영진 추가 모집 메뉴' }))
    await user.click(await screen.findByRole('menuitem', { name: '공고 삭제' }))

    expect(await screen.findByText('작성 중인 공고가 없어요')).toBeInTheDocument()
    expect(await screen.findByRole('tab', { name: '작성 중 0' })).toBeInTheDocument()
  })

  it('탭의 공고를 처음 불러오는 동안 목록 로딩 상태를 알리고, 받으면 카드로 교체', async () => {
    const user = userEvent.setup()
    renderHome()
    // 진행 중 탭을 받은 뒤 처음 여는 탭이어야 조회 중 상태가 생김
    await screen.findByRole('heading', { name: 'UXUX 14기 운영진 모집' })

    await user.click(screen.getByRole('tab', { name: /종료된 공고/ }))

    expect(screen.getByRole('status', { name: '공고 목록 불러오는 중' })).toBeInTheDocument()
    expect(
      await screen.findByRole('heading', { name: 'UXUX 13기 신입 부원 모집' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('status', { name: '공고 목록 불러오는 중' })).not.toBeInTheDocument()
  })

  it('탭 숫자와 첫 탭 목록까지 받기 전에는 홈 로딩 상태 하나만 표시', async () => {
    renderHome()

    expect(screen.getByRole('status', { name: '운영진 홈 불러오는 중' })).toBeInTheDocument()
    expect(screen.queryByRole('tab')).not.toBeInTheDocument()

    // 탭은 숫자와 함께 처음 나타남
    expect(await screen.findByRole('tab', { name: '진행 중 2' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'UXUX 14기 운영진 모집' })).toBeInTheDocument()
    expect(screen.queryByRole('status', { name: '운영진 홈 불러오는 중' })).not.toBeInTheDocument()
  })

  it('공고가 없는 단체는 빈 상태 표시', async () => {
    renderHome('2')

    expect(
      await screen.findByRole('heading', { level: 1, name: '멋쟁이개발자' }),
    ).toBeInTheDocument()
    expect(await screen.findByText('진행 중인 공고가 없어요')).toBeInTheDocument()
  })

  it('요약 조회만 실패하면 목록은 유지하고 안내, 다시 시도로 탭 숫자 복구', async () => {
    server.use(
      graphqlApi.query('ManagedPostingSummary', () =>
        HttpResponse.json({
          errors: [{ message: '서버 오류', extensions: { code: 'COMMON_500' } }],
          data: null,
        }),
      ),
    )
    const user = userEvent.setup()
    renderHome()

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('탭 숫자와 UP 잔여 횟수를 불러오지 못했어요')
    expect(screen.getByRole('heading', { name: 'UXUX 14기 운영진 모집' })).toBeInTheDocument()

    server.resetHandlers()
    await user.click(within(alert).getByRole('button', { name: '다시 시도' }))

    expect(await screen.findByRole('tab', { name: '진행 중 2' })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'UXUX 14기 운영진 모집' })).toBeInTheDocument()
  })

  it('목록 조회에 계속 실패하면 오류 안내, 서버가 회복되면 다시 시도로 복구', async () => {
    server.use(
      graphqlApi.query('OrganizationPostings', () =>
        HttpResponse.json({
          errors: [{ message: '서버 오류', extensions: { code: 'COMMON_500' } }],
          data: null,
        }),
      ),
    )
    const user = userEvent.setup()
    renderHome()

    const retryButton = await screen.findByRole('button', { name: '다시 시도' })
    server.resetHandlers()
    await user.click(retryButton)

    expect(
      await screen.findByRole('heading', { name: 'UXUX 14기 운영진 모집' }),
    ).toBeInTheDocument()
  })
})
