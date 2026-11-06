import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { confirmDocumentResults } from '@/features/recruitment/api/organizer'
import { DocumentResultConfirmDialog } from './documentResultConfirmDialog'

vi.mock('@/features/recruitment/api/organizer', () => ({
  confirmDocumentResults: vi.fn(),
}))

const confirmMock = vi.mocked(confirmDocumentResults)

function renderDialog(hasInterviewStep = true) {
  const onOpenChange = vi.fn()

  render(
    <QueryClientProvider client={new QueryClient()}>
      <DocumentResultConfirmDialog
        recruitmentId="1"
        isOpen
        onOpenChange={onOpenChange}
        hasInterviewStep={hasInterviewStep}
        resultCounts={{ pass: 18, hold: 0, fail: 30 }}
        onCloseAutoFocus={() => undefined}
      />
    </QueryClientProvider>,
  )

  return onOpenChange
}

describe('DocumentResultConfirmDialog', () => {
  beforeEach(() => {
    confirmMock.mockReset()
  })

  it('면접 유무에 맞는 안내와 공고 전체 인원 표시', () => {
    renderDialog(false)

    expect(
      screen.getByText(/이후 지원자에게 서류 전형 결과를 안내할 수 있어요/),
    ).toBeInTheDocument()
    expect(screen.getByText('18명')).toBeInTheDocument()
    expect(screen.getByText('30명')).toBeInTheDocument()
  })

  it('확정에 성공하면 팝업 닫기', async () => {
    confirmMock.mockResolvedValue()
    const onOpenChange = renderDialog()

    await userEvent.click(screen.getByRole('button', { name: '확정하기' }))

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
  })

  it('확정에 실패하면 팝업을 유지하고 실패 안내', async () => {
    confirmMock.mockRejectedValue(new Error('failed'))
    const onOpenChange = renderDialog()

    await userEvent.click(screen.getByRole('button', { name: '확정하기' }))

    expect(
      (await screen.findAllByText('결과를 확정하지 못했어요. 다시 시도해 주세요.')).length,
    ).toBeGreaterThan(0)
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('확정에 실패한 뒤 다시 시도 가능', async () => {
    confirmMock.mockRejectedValueOnce(new Error('failed')).mockResolvedValueOnce()
    const onOpenChange = renderDialog()
    const confirmButton = screen.getByRole('button', { name: '확정하기' })

    await userEvent.click(confirmButton)
    await screen.findAllByText('결과를 확정하지 못했어요. 다시 시도해 주세요.')
    await userEvent.click(confirmButton)

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
    expect(confirmMock).toHaveBeenCalledTimes(2)
  })
})
