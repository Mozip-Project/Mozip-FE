'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import ArrowRightIcon from '@/assets/icons/arrowRight.svg'
import { Button } from '@/components/ui/Button/button'
import { PageHeader } from '@/components/ui/PageHeader/pageHeader'
import { SaveStatus, type SaveState } from '@/components/ui/SaveStatus/saveStatus'
import { StepList } from '@/components/ui/StepList/stepList'
import type { PostingPosition } from '@/features/posting/types'
import { getPostingDetailPath } from '@/features/posting/utils/postingRoutes'
import {
  createApplicationInfoSchema,
  EMPTY_APPLICATION_INFO,
  type ApplicationInfoValues,
} from '@/features/recruitment/schemas/applicationInfoSchema'
import type { ApplicantProfile } from '@/features/recruitment/types'
import { ApplicationInfoStep } from './applicationInfoStep'

const APPLICATION_STEPS = [
  { id: 'info', label: '지원 정보 확인' },
  { id: 'form', label: '지원서 작성' },
] as const

type ApplicationFormProps = {
  postingId: string
  postingTitle: string
  // null은 포지션 없는 모집
  positions: readonly PostingPosition[] | null
  requiresProfilePhoto: boolean
  profile: ApplicantProfile
}

function ApplicationForm({
  postingId,
  postingTitle,
  positions,
  requiresProfilePhoto,
  profile,
}: ApplicationFormProps) {
  const infoSchema = createApplicationInfoSchema({
    selectablePositionIds:
      positions?.filter((position) => position.appliedAt === null).map((position) => position.id) ??
      null,
    requiresProfilePhoto,
    hasSavedPhoto: profile.savedPhotoUrl !== null,
  })
  // 한 번 벗어난 필드부터 에러 표시
  const { control } = useForm<ApplicationInfoValues>({
    mode: 'onTouched',
    resolver: zodResolver(infoSchema),
    defaultValues: EMPTY_APPLICATION_INFO,
  })
  const values = useWatch({ control })
  const [saveState, setSaveState] = useState<SaveState>({ status: 'idle' })
  const canGoNext = infoSchema.safeParse(values).success

  // TODO: 임시 저장 API 연결
  function handleTemporarySave() {
    setSaveState({ status: 'saved', savedAt: new Date() })
  }

  return (
    <div className="mx-auto flex max-w-195 flex-col gap-gap-xl">
      <PageHeader
        backLink={{ href: getPostingDetailPath(postingId), label: '공고 상세' }}
        title={postingTitle}
        actions={
          <div className="flex items-center gap-gap-m">
            <Button variant="secondary" size="m" onClick={handleTemporarySave}>
              임시 저장
            </Button>
            {/* TODO: 2단계 화면 추가 후 이동 연결 */}
            <Button size="m" disabled={!canGoNext}>
              다음
              <ArrowRightIcon aria-hidden />
            </Button>
          </div>
        }
      />
      <div className="flex items-center justify-between gap-gap-l">
        <StepList label="지원 단계" steps={APPLICATION_STEPS} currentIndex={0} />
        <SaveStatus {...saveState} />
      </div>

      <ApplicationInfoStep
        control={control}
        positions={positions}
        profile={profile}
        requiresProfilePhoto={requiresProfilePhoto}
      />
    </div>
  )
}

export { ApplicationForm }
