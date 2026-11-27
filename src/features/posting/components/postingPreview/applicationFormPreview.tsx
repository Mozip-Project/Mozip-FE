'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { BackLink } from '@/components/ui/BackLink/backLink'
import { Chip } from '@/components/ui/Chip/chip'
import type { PreviewApplicationForm } from '@/features/posting/utils/postingPreview'
import { ApplicationAnswerStep } from '@/features/recruitment/components/applicant/applicationAnswerStep/applicationAnswerStep'
import {
  createEmptyApplicationAnswers,
  type ApplicationAnswerValues,
} from '@/features/recruitment/schemas/applicationAnswerSchema'
import { PreviewStage } from './previewStage'

type ApplicationFormPreviewProps = {
  postingTitle: string
  forms: readonly PreviewApplicationForm[]
}

function ApplicationFormPreview({ postingTitle, forms }: ApplicationFormPreviewProps) {
  const [selectedFormId, setSelectedFormId] = useState(forms[0]?.id)
  // 입력해 볼 수만 있고 저장·제출은 없음
  const [emptyAnswers] = useState(() =>
    createEmptyApplicationAnswers(forms.flatMap(({ questions }) => questions)),
  )
  const { control } = useForm<ApplicationAnswerValues>({ defaultValues: emptyAnswers })
  const selectedForm = forms.find(({ id }) => id === selectedFormId)
  const hasPositions = forms.some(({ positionName }) => positionName !== null)

  return (
    <>
      {hasPositions && (
        <div role="group" aria-label="포지션" className="flex shrink-0 flex-wrap gap-gap-s">
          {forms.map(({ id, positionName }) => (
            <Chip
              key={id}
              pressed={id === selectedFormId}
              onPressedChange={() => setSelectedFormId(id)}
            >
              {positionName}
            </Chip>
          ))}
        </div>
      )}

      {/* 포지션을 바꾸면 맨 위부터 보이도록 새로 그림 */}
      <PreviewStage key={selectedFormId}>
        <div className="flex flex-col gap-gap-s">
          {/* 지원자에게 보이는 모습만 확인, 이동 차단 */}
          <div inert className="flex">
            <BackLink href="/" label="공고 상세" />
          </div>
          <h2 className="text-title3 font-bold break-words break-keep text-neutral">
            {postingTitle}
          </h2>
        </div>
        <ApplicationAnswerStep control={control} questions={selectedForm?.questions ?? []} />
      </PreviewStage>
    </>
  )
}

export { ApplicationFormPreview }
