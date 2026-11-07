'use client'

import { useParams } from 'next/navigation'
import { Badge } from '@/components/ui/Badge/badge'
import { PageHeader } from '@/components/ui/PageHeader/pageHeader'
import { useDocumentResultOverview } from '@/features/recruitment/hooks/useDocumentResults'
import { formatDateTimeWithWeekday } from '@/utils/date'

const TITLE = '서류 평가 취합'
const HEADER_CLASS = 'min-h-10'

function DocumentResultHeader() {
  const { recruitmentId } = useParams<{ recruitmentId: string }>()
  const overview = useDocumentResultOverview(recruitmentId)

  if (!overview?.confirmedAt) {
    return <DocumentResultHeaderFallback />
  }

  return (
    <PageHeader
      title={TITLE}
      description={`${formatDateTimeWithWeekday(new Date(overview.confirmedAt))}에 결과를 확정했어요.`}
      actions={
        <Badge tone="positive" variant="weak">
          확정 완료
        </Badge>
      }
      className={HEADER_CLASS}
    />
  )
}

function DocumentResultHeaderFallback() {
  return <PageHeader title={TITLE} className={HEADER_CLASS} />
}

export { DocumentResultHeader, DocumentResultHeaderFallback }
