import { RecruitmentStageGuide } from '@/features/recruitment/components/recruitmentStage/recruitmentStageGuide'
import { RecruitmentStepper } from '@/features/recruitment/components/recruitmentStage/recruitmentStepper'
import type { OngoingRecruitment } from '@/features/recruitment/types'

type OngoingRecruitmentCardProps = {
  recruitment: OngoingRecruitment
}

function OngoingRecruitmentCard({
  recruitment: { id, title, progress },
}: OngoingRecruitmentCardProps) {
  return (
    <article className="flex flex-col gap-5 rounded-l border border-neutral-weak bg-layer-default p-padding-xl">
      <h3 className="flex min-h-10 items-center text-heading2 font-bold break-words break-keep text-neutral">
        {title}
      </h3>
      <RecruitmentStepper progress={progress} />
      <RecruitmentStageGuide recruitmentId={id} title={title} progress={progress} />
    </article>
  )
}

export { OngoingRecruitmentCard }
