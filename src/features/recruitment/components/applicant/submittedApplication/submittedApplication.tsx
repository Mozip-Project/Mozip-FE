'use client'

import { use } from 'react'
import FileTextIcon from '@/assets/icons/fileText.svg'
import { BackLink } from '@/components/ui/BackLink/backLink'
import { EmptyState } from '@/components/ui/EmptyState/emptyState'
import { InlineNotice } from '@/components/ui/InlineNotice/inlineNotice'
import { PageHeader } from '@/components/ui/PageHeader/pageHeader'
import { useSubmittedApplicationQuery } from '@/features/recruitment/api/applicant/queries'
import { ApplicationAnswerCards } from '@/features/recruitment/components/applicationAnswerCards/applicationAnswerCards'
import { AvailabilityCard } from '@/features/recruitment/components/applicationAnswerCards/availabilityCard'
import { APPLICATION_NOT_FOUND_CODE } from '@/features/recruitment/types'
import { toSubmittedApplication } from '@/features/recruitment/utils/submittedApplication'
import { ApiError } from '@/lib/apiError'
import { SubmittedApplicationSkeleton } from './submittedApplicationSkeleton'

const BACK_LINK = { href: '/applications', label: '내 지원' } as const
const ANSWERS_HEADING_ID = 'submitted-application-answers'

type SubmittedApplicationProps = Pick<PageProps<'/applications/[applicationId]'>, 'params'>

// 제출한 지원서 읽기 전용 화면
function SubmittedApplication({ params }: SubmittedApplicationProps) {
  const { applicationId } = use(params)
  const { data, error, isError } = useSubmittedApplicationQuery(applicationId)
  const application = data && toSubmittedApplication(data)
  const isNotFound =
    (error instanceof ApiError && error.code === APPLICATION_NOT_FOUND_CODE) ||
    (application && !application.submittedAtLabel)

  // 재조회 실패는 이미 받은 지원서를 그대로 표시
  if (isNotFound || (isError && !application)) {
    return (
      <div className="mx-auto flex max-w-195 flex-col gap-gap-xl">
        <BackLink {...BACK_LINK} className="self-start" />
        <h1 className="sr-only">제출한 지원서</h1>
        <div role="alert">
          <EmptyState
            icon={<FileTextIcon className="size-7" />}
            title={isNotFound ? '지원서를 찾을 수 없어요' : '지원서 조회에 실패했어요'}
            className="min-h-162.5 justify-center border-0"
          />
        </div>
      </div>
    )
  }
  if (!application) {
    return <SubmittedApplicationSkeleton />
  }

  const { title, submittedAtLabel, questionCards, availableSlots } = application

  return (
    <div className="mx-auto flex max-w-195 flex-col gap-gap-xl">
      <PageHeader
        backLink={BACK_LINK}
        title={`${title} 지원서`}
        description={`${submittedAtLabel} 제출 완료`}
        className="gap-gap-s"
      />
      <InlineNotice tone="neutral">제출한 지원서는 수정하거나 철회할 수 없어요.</InlineNotice>
      <section aria-labelledby={ANSWERS_HEADING_ID} className="flex flex-col gap-gap-l">
        <h2 id={ANSWERS_HEADING_ID} className="sr-only">
          문항과 답변
        </h2>
        <ApplicationAnswerCards questionCards={questionCards} />
        {availableSlots.length > 0 && <AvailabilityCard slots={availableSlots} />}
      </section>
    </div>
  )
}

export { SubmittedApplication }
