import FileTextIcon from '@/assets/icons/fileText.svg'
import { BackLink } from '@/components/ui/BackLink/backLink'
import { EmptyState } from '@/components/ui/EmptyState/emptyState'
import { getPostingDetailPath } from '@/features/posting/utils/postingRoutes'

type ApplicationFormErrorProps = {
  postingId: string
}

// TODO: 조회 실패 화면 디자인 나오면 교체, 지금은 공고 상세 실패 화면과 같은 모양
function ApplicationFormError({ postingId }: ApplicationFormErrorProps) {
  return (
    <div className="mx-auto flex max-w-195 flex-col gap-gap-xl">
      <BackLink href={getPostingDetailPath(postingId)} label="공고 상세" className="self-start" />
      <h1 className="sr-only">지원서 작성</h1>
      <div role="alert">
        <EmptyState
          icon={<FileTextIcon className="size-7" />}
          title="지원서 조회에 실패했어요"
          className="min-h-162.5 justify-center border-0"
        />
      </div>
    </div>
  )
}

export { ApplicationFormError }
