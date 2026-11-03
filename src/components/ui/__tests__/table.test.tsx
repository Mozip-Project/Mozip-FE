import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TableCell, TableHeadAction, TableHeadCell } from '@/components/ui/Table/table'

describe('Table', () => {
  it('헤더 셀과 데이터 셀을 표 역할로 노출', () => {
    render(
      <div role="table" aria-label="지원자">
        <div role="row">
          <TableHeadCell>지원자</TableHeadCell>
        </div>
        <div role="row">
          <TableCell type="name">김모집</TableCell>
        </div>
      </div>,
    )

    const table = screen.getByRole('table', { name: '지원자' })
    expect(within(table).getByRole('columnheader', { name: '지원자' })).toBeInTheDocument()
    expect(within(table).getByRole('cell', { name: '김모집' })).toBeInTheDocument()
  })

  it('말줄임될 수 있는 텍스트는 title로 전체 내용 제공', () => {
    render(<TableCell type="text">아주 긴 텍스트</TableCell>)

    expect(screen.getByText('아주 긴 텍스트')).toHaveAttribute('title', '아주 긴 텍스트')
  })

  it('헤더 액션 버튼 클릭 시 핸들러 호출', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(<TableHeadAction icon="sort" label="제출일 정렬" onClick={handleClick} />)

    await user.click(screen.getByRole('button', { name: '제출일 정렬' }))

    expect(handleClick).toHaveBeenCalledOnce()
  })
})
