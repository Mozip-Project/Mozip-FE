import { PageHeader } from '@/components/ui/PageHeader/pageHeader'
import type { ResultNoticeKind } from '@/features/recruitment/types'
import {
  getDocumentResultPath,
  getInterviewTimetablePath,
} from '@/features/recruitment/utils/recruitmentRoutes'
import type { Route } from 'next'

const TITLE = '서류 결과 안내'

// 들어온 화면으로 돌아가는 링크와 안내 범위 문구만 다름
const HEADER_BY_KIND = {
  document: {
    description: '서류 평가 결과를 지원자에게 알려요. 메일과 MOZIP 알림으로 함께 발송해요.',
    backLabel: '서류 평가 취합',
    getBackPath: getDocumentResultPath,
  },
  interview: {
    description: '서류 결과와 면접 일정을 지원자에게 알려요. 메일과 MOZIP 알림으로 함께 발송해요.',
    backLabel: '면접 타임테이블',
    getBackPath: getInterviewTimetablePath,
  },
} satisfies Record<
  ResultNoticeKind,
  { description: string; backLabel: string; getBackPath: (recruitmentId: string) => Route }
>

type ResultNoticeHeaderProps = {
  kind: ResultNoticeKind
  params: Promise<{ recruitmentId: string }>
}

async function ResultNoticeHeader({ kind, params }: ResultNoticeHeaderProps) {
  const { recruitmentId } = await params
  const { description, backLabel, getBackPath } = HEADER_BY_KIND[kind]

  return (
    <PageHeader
      backLink={{ href: getBackPath(recruitmentId), label: backLabel }}
      title={TITLE}
      description={description}
    />
  )
}

function ResultNoticeHeaderFallback({ kind }: Pick<ResultNoticeHeaderProps, 'kind'>) {
  return <PageHeader title={TITLE} description={HEADER_BY_KIND[kind].description} />
}

export { ResultNoticeHeader, ResultNoticeHeaderFallback }
