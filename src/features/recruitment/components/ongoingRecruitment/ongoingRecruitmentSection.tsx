import FileTextIcon from '@/assets/icons/fileText.svg'
import { EmptyState } from '@/components/ui/EmptyState/emptyState'
import { SectionHeader } from '@/components/ui/SectionHeader/sectionHeader'
import type { OngoingRecruitment } from '@/features/recruitment/types'
import { OngoingRecruitmentCard } from './ongoingRecruitmentCard'

type OngoingRecruitmentSectionProps = {
  recruitments: readonly OngoingRecruitment[]
}

function OngoingRecruitmentSection({ recruitments }: OngoingRecruitmentSectionProps) {
  return (
    <section className="flex flex-col gap-gap-l">
      <SectionHeader title="진행 중인 모집" moreHref="/manage/recruitments" moreLabel="공고 목록" />
      {recruitments.length === 0 ? (
        <EmptyState
          icon={<FileTextIcon className="size-7" />}
          title="진행 중인 모집이 없어요"
          description="공고를 작성하고 지원자를 모집해 보세요"
          className="min-h-100 justify-center border-0"
        />
      ) : (
        <ul className="flex flex-col gap-gap-l">
          {recruitments.map((recruitment) => (
            <li key={recruitment.id}>
              <OngoingRecruitmentCard recruitment={recruitment} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export { OngoingRecruitmentSection }
