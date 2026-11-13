import { PageHeader } from '@/components/ui/PageHeader/pageHeader'
import { getDocumentResultPath } from '@/features/recruitment/utils/recruitmentRoutes'

const TITLE = '서류 결과 안내'
const DESCRIPTION = '서류 평가 결과를 지원자에게 알려요. 메일과 MOZIP 알림으로 함께 발송해요.'

type ResultNoticeHeaderProps = Pick<
  PageProps<'/manage/recruitments/[recruitmentId]/documents/summary/notice'>,
  'params'
>

async function ResultNoticeHeader({ params }: ResultNoticeHeaderProps) {
  const { recruitmentId } = await params

  return (
    <PageHeader
      backLink={{ href: getDocumentResultPath(recruitmentId), label: '서류 평가 취합' }}
      title={TITLE}
      description={DESCRIPTION}
    />
  )
}

function ResultNoticeHeaderFallback() {
  return <PageHeader title={TITLE} description={DESCRIPTION} />
}

export { ResultNoticeHeader, ResultNoticeHeaderFallback }
