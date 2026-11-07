import { useState } from 'react'
import type { DocumentResult } from '@/features/recruitment/types'
import {
  ResultTable,
  ResultTableConfirmedBadge,
  ResultTableRow,
  ResultTableSelector,
} from './resultTable'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'Features/Recruitment/ResultTable',
  component: ResultTable,
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta<typeof ResultTable>

export default meta
type Story = StoryObj

function SelectableRow({
  initialResult,
  averageScore,
}: {
  initialResult: DocumentResult
  averageScore: number | null
}) {
  const [result, setResult] = useState(initialResult)

  return (
    <ResultTableRow
      rank={1}
      name="김모집"
      position="디자인"
      opinionCounts={{ pass: 2, hold: 1, fail: 0 }}
      averageScore={averageScore}
      result={
        <ResultTableSelector
          aria-label="김모집 최종 결과"
          value={result}
          onValueChange={setResult}
        />
      }
    />
  )
}

export const Default: Story = {
  render: () => (
    <ResultTable label="결과 표" hasScore>
      <SelectableRow initialResult="pass" averageScore={3.8} />
    </ResultTable>
  ),
}

export const WithoutScore: Story = {
  render: () => (
    <ResultTable label="결과 표" hasScore={false}>
      <SelectableRow initialResult="pass" averageScore={null} />
    </ResultTable>
  ),
}

export const EvaluationInProgress: Story = {
  render: () => (
    <ResultTable label="결과 표" hasScore>
      <ResultTableRow
        rank={4}
        name="한결"
        position="개발"
        opinionCounts={{ pass: 1, hold: 1, fail: 0, pending: 1 }}
        averageScore={3.5}
        result={
          <ResultTableSelector aria-label="한결 최종 결과" value="hold" onValueChange={() => {}} />
        }
      />
    </ResultTable>
  ),
}

export const Confirmed: Story = {
  render: () => (
    <ResultTable label="결과 표" hasScore>
      <ResultTableRow
        rank={1}
        name="정세나"
        position="디자인"
        opinionCounts={{ pass: 3, hold: 0, fail: 0 }}
        averageScore={4.6}
        result={<ResultTableConfirmedBadge result="pass" />}
      />
      <ResultTableRow
        rank={5}
        name="오하늘"
        position="개발"
        opinionCounts={{ pass: 1, hold: 1, fail: 1 }}
        averageScore={3}
        result={<ResultTableConfirmedBadge result="fail" />}
      />
    </ResultTable>
  ),
}

export const Loading: Story = {
  render: () => <ResultTable label="결과 표" hasScore isLoading loadingRowCount={2} />,
}
