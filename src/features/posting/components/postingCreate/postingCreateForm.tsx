'use client'

import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import ArrowRightIcon from '@/assets/icons/arrowRight.svg'
import { Button } from '@/components/ui/Button/button'
import { PageHeader } from '@/components/ui/PageHeader/pageHeader'
import { SaveStatus, type SaveState } from '@/components/ui/SaveStatus/saveStatus'
import {
  EMPTY_POSTING_CREATE,
  type PostingCreateValues,
} from '@/features/posting/schemas/postingCreateValues'
import { postingInfoSchema } from '@/features/posting/schemas/postingInfoSchema'
import { postingMethodSchema } from '@/features/posting/schemas/postingMethodSchema'
import { getPostingScheduleSchema } from '@/features/posting/schemas/postingScheduleSchema'
import {
  getPostingCreateSteps,
  type PostingCreateStep,
} from '@/features/posting/utils/postingCreateSteps'
import { useToast } from '@/providers/toastProvider'
import { PostingCreateStepList } from './postingCreateStepList'
import { PostingInfoStep } from './postingInfoStep'
import { PostingMethodStep } from './postingMethodStep'
import { PostingScheduleStep } from './postingScheduleStep'

type StepId = PostingCreateStep['id']

// TODO: 지원서 양식·면접 시간·검토 단계 구현 후 단계별 검증 연결
function getStepSchema(stepId: StepId | undefined, hasInterview: boolean) {
  switch (stepId) {
    case 'info':
      return postingInfoSchema
    case 'schedule':
      return getPostingScheduleSchema(hasInterview)
    case 'method':
      return postingMethodSchema
    case 'form':
    case 'interview':
    case 'review':
    case undefined:
      return null
  }
}

type PostingCreateFormProps = {
  hasInterview: boolean
}

function PostingCreateForm({ hasInterview }: PostingCreateFormProps) {
  const { control, register } = useForm<PostingCreateValues>({
    defaultValues: EMPTY_POSTING_CREATE,
  })
  const values = useWatch({ control })
  const [stepIndex, setStepIndex] = useState(0)
  const [furthestIndex, setFurthestIndex] = useState(0)
  const [saveState, setSaveState] = useState<SaveState>({ status: 'idle' })
  const { showToast } = useToast()
  const steps = getPostingCreateSteps(hasInterview)
  const currentStepId = steps[stepIndex]?.id
  // TODO: 지원서 양식 단계 구현 후 모집 방식 다음 이동 연결
  const hasNextScreen = currentStepId !== 'method'
  const canGoNext =
    hasNextScreen &&
    (getStepSchema(currentStepId, hasInterview)?.safeParse(values).success ?? false)

  // TODO: 임시 저장 API 연결 후 저장 성공 응답 시점·서버 저장 시각으로 교체
  function handleTemporarySave() {
    setSaveState({ status: 'saved', savedAt: new Date() })
    showToast({
      title: '임시 저장되었습니다',
      description: '공고 관리 탭에서 언제든 이어 쓸 수 있어요',
    })
  }

  // 한 번 다녀온 단계까지, 그 앞 단계가 모두 통과 조건을 만족할 때만 이동 가능
  function canSelectStep(index: number) {
    if (index === stepIndex || index > furthestIndex) {
      return false
    }
    return steps
      .slice(0, index)
      .every((step) => getStepSchema(step.id, hasInterview)?.safeParse(values).success ?? true)
  }

  function moveToStep(index: number) {
    setStepIndex(index)
    setFurthestIndex(Math.max(furthestIndex, index))
    window.scrollTo({ top: 0 })
  }

  function handleNext() {
    if (canGoNext) {
      moveToStep(stepIndex + 1)
    }
  }

  return (
    <div className="flex flex-col gap-gap-xl">
      <PageHeader
        title="공고 작성"
        actions={
          <div className="flex items-center gap-gap-m">
            <Button variant="secondary" size="m" onClick={handleTemporarySave}>
              임시 저장
            </Button>
            <Button size="m" disabled={!canGoNext} onClick={handleNext}>
              다음
              <ArrowRightIcon aria-hidden />
            </Button>
          </div>
        }
      />
      <div className="flex items-center justify-between gap-gap-l">
        <PostingCreateStepList
          steps={steps}
          currentIndex={stepIndex}
          canSelectStep={canSelectStep}
          onStepSelect={moveToStep}
        />
        <SaveStatus {...saveState} />
      </div>
      {currentStepId === 'info' && <PostingInfoStep control={control} register={register} />}
      {currentStepId === 'schedule' && (
        <PostingScheduleStep control={control} hasInterview={hasInterview} />
      )}
      {currentStepId === 'method' && <PostingMethodStep control={control} />}
    </div>
  )
}

export { PostingCreateForm }
