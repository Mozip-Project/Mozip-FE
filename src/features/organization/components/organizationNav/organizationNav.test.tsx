import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ToastProvider } from '@/providers/toastProvider'
import { OrganizationNav } from './organizationNav'

vi.mock('next/navigation', () => ({
  usePathname: () => '/manage/organization/members',
}))

describe('OrganizationNav', () => {
  it('준비 중인 메뉴는 이동 없이 안내 토스트 표시', async () => {
    const user = userEvent.setup()
    render(
      <ToastProvider>
        <OrganizationNav />
      </ToastProvider>,
    )

    expect(screen.getByRole('link', { name: '운영진 관리' })).toHaveAttribute('aria-current')
    expect(screen.queryByRole('link', { name: '팀 설정' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '팀 설정' }))

    expect(await screen.findByText('준비 중인 기능이에요')).toBeInTheDocument()
  })
})
