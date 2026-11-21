import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { graphqlApi } from '@/mocks/graphqlApi'
import { server } from '@/mocks/server'
import { OrganizationMembersContent } from './organizationMembersContent'

function renderMembers(savedOrganizationId?: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  return render(
    <QueryClientProvider client={queryClient}>
      <OrganizationMembersContent savedOrganizationId={savedOrganizationId} />
    </QueryClientProvider>,
  )
}

function failMembersQueryOnce() {
  server.use(
    graphqlApi.query(
      'OrganizationMembers',
      () =>
        HttpResponse.json({
          errors: [{ message: '서버 오류', extensions: { code: 'COMMON_500' } }],
          data: null,
        }),
      { once: true },
    ),
  )
}

beforeAll(() => {
  vi.stubEnv('NEXT_PUBLIC_GRAPHQL_ENDPOINT', 'https://api.test/graphql')
})

afterAll(() => {
  vi.unstubAllEnvs()
})

describe('OrganizationMembersContent', () => {
  it('저장한 단체가 없으면 서버가 준 단체의 운영진 표시', async () => {
    renderMembers()

    expect(await screen.findByRole('heading', { name: '운영진 4명' })).toBeInTheDocument()
    expect(screen.getByText('김하준 (나)')).toBeInTheDocument()
  })

  it('저장한 단체의 운영진 표시', async () => {
    renderMembers('2')

    expect(await screen.findByRole('heading', { name: '운영진 2명' })).toBeInTheDocument()
    expect(screen.getByText('정예린')).toBeInTheDocument()
    expect(screen.getByText('김하준 (나)')).toBeInTheDocument()
  })

  it('목록을 불러오지 못하면 안내 후 다시 시도', async () => {
    const user = userEvent.setup()
    failMembersQueryOnce()
    renderMembers()

    expect(await screen.findByRole('alert')).toHaveTextContent('운영진 목록을 불러오지 못했어요')

    await user.click(screen.getByRole('button', { name: '다시 시도' }))

    expect(await screen.findByRole('heading', { name: '운영진 4명' })).toBeInTheDocument()
  })
})
