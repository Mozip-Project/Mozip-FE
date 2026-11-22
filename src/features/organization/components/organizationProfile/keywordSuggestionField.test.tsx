import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { KeywordSuggestionField } from './keywordSuggestionField'

function ControlledKeywordSuggestionField() {
  const [keywords, setKeywords] = useState<string[]>([])
  return <KeywordSuggestionField value={keywords} onChange={setKeywords} />
}

function renderField() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  return render(
    <QueryClientProvider client={queryClient}>
      <ControlledKeywordSuggestionField />
    </QueryClientProvider>,
  )
}

beforeAll(() => {
  vi.stubEnv('NEXT_PUBLIC_GRAPHQL_ENDPOINT', 'https://api.test/graphql')
})

afterAll(() => {
  vi.unstubAllEnvs()
})

describe('KeywordSuggestionField', () => {
  it('입력을 멈추면 앞글자가 같은 추천 키워드를 보여주고 골라서 추가', async () => {
    const user = userEvent.setup()
    renderField()

    await user.type(screen.getByRole('combobox', { name: /검색 키워드/ }), '디자')

    expect(await screen.findByRole('option', { name: '디자인 시스템' })).toBeInTheDocument()

    await user.click(screen.getByRole('option', { name: '디자인' }))

    expect(screen.getByText('디자인')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /검색 키워드/ })).toHaveValue('')
  })
})
