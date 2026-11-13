import { Badge } from '@/components/ui/Badge/badge'
import { Stepper, type StepperStep } from '@/components/ui/Stepper/stepper'
import type { RecruitmentProgress } from '@/features/recruitment/types'
import { getRecruitmentSteps } from '@/features/recruitment/utils/recruitmentStepper'

type RecruitmentStepperProps = {
  progress: RecruitmentProgress
}

function RecruitmentStepper({ progress }: RecruitmentStepperProps) {
  const steps = getRecruitmentSteps(progress).map(
    ({ stage, label, status, dateLabel }): StepperStep => {
      const isDraft = stage === 'posting' && status === 'current'

      return {
        id: stage,
        label,
        status,
        description: dateLabel,
        badge: isDraft && (
          <Badge tone="critical" variant="weak">
            작성 중
          </Badge>
        ),
      }
    },
  )

  return <Stepper label="모집 단계" steps={steps} />
}

export { RecruitmentStepper }
