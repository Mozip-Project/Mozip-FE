import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Stepper } from '@/components/ui/Stepper/stepper'

describe('Stepper', () => {
  it('현재 단계에 aria-current, 단계마다 숨김 상태 문구 연결', () => {
    render(
      <Stepper
        label="모집 단계"
        steps={[
          { id: 'a', label: '공고 작성', status: 'done' },
          { id: 'b', label: '지원 접수', status: 'current' },
          { id: 'c', label: '서류 평가', status: 'upcoming' },
        ]}
      />,
    )

    const items = screen.getAllByRole('listitem')

    expect(screen.getByRole('list', { name: '모집 단계' })).toBeInTheDocument()
    expect(items.map((item) => item.getAttribute('aria-current'))).toEqual([null, 'step', null])
    expect(items[0]).toHaveTextContent('완료 공고 작성')
    expect(items[1]).toHaveTextContent('진행 중 지원 접수')
    expect(items[2]).toHaveTextContent('예정 서류 평가')
  })
})
