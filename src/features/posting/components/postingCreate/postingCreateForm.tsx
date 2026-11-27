'use client'

import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import ArrowRightIcon from '@/assets/icons/arrowRight.svg'
import { Button } from '@/components/ui/Button/button'
import { PageHeader } from '@/components/ui/PageHeader/pageHeader'
import { SaveStatus } from '@/components/ui/SaveStatus/saveStatus'
import { StepList } from '@/components/ui/StepList/stepList'
import { useCurrentOrganization } from '@/features/organization/hooks/useCurrentOrganization'
import {
  usePostingDraftSave,
  type SavedPostingDraft,
} from '@/features/posting/hooks/usePostingDraftSave'
import { usePostingPublish } from '@/features/posting/hooks/usePostingPublish'
import {
  EMPTY_POSTING_CREATE,
  type PostingCreateValues,
} from '@/features/posting/schemas/postingCreateValues'
import { postingFormSchema } from '@/features/posting/schemas/postingFormSchema'
import { postingInfoSchema } from '@/features/posting/schemas/postingInfoSchema'
import { postingInterviewSchema } from '@/features/posting/schemas/postingInterviewSchema'
import { postingMethodSchema } from '@/features/posting/schemas/postingMethodSchema'
import { getPostingScheduleSchema } from '@/features/posting/schemas/postingScheduleSchema'
import { filterDatesInInterviewPeriod } from '@/features/posting/utils/interviewPeriod'
import { getSlotDate } from '@/features/posting/utils/interviewTimetable'
import {
  getPostingCreateSteps,
  type PostingCreateStep,
} from '@/features/posting/utils/postingCreateSteps'
import { getPositionNames } from '@/features/posting/utils/postingPositions'
import {
  DEFAULT_QUESTION_TITLES,
  resizeQuestionSets,
} from '@/features/posting/utils/postingQuestions'
import { useToast } from '@/providers/toastProvider'
import { PostingFormStep } from './postingFormStep/postingFormStep'
import { PostingInfoStep } from './postingInfoStep/postingInfoStep'
import { PostingInterviewStep } from './postingInterviewStep/postingInterviewStep'
import { PostingMethodStep } from './postingMethodStep/postingMethodStep'
import { PostingPublishDialog } from './postingPublishDialog'
import { type EditableStepId } from './postingReviewStep/postingReviewSections'
import { PostingReviewStep } from './postingReviewStep/postingReviewStep'
import { PostingScheduleStep } from './postingScheduleStep/postingScheduleStep'

type StepId = PostingCreateStep['id']

// 검토 단계는 입력이 없어 검증 대상 없음
function getStepSchema(stepId: StepId | undefined, hasInterview: boolean) {
  switch (stepId) {
    case 'info':
      return postingInfoSchema
    case 'schedule':
      return getPostingScheduleSchema(hasInterview)
    case 'method':
      return postingMethodSchema
    case 'form':
      return postingFormSchema
    case 'interview':
      return postingInterviewSchema
    case 'review':
    case undefined:
      return null
  }
}

// 이어서 작성할 때 탭으로 갈 수 있는 단계: 입력 조건을 처음 통과하지 못한 단계까지
function getInitialFurthestIndex(
  steps: PostingCreateStep[],
  values: PostingCreateValues,
  hasInterview: boolean,
) {
  const firstIncompleteIndex = steps.findIndex(
    ({ id }) => getStepSchema(id, hasInterview)?.safeParse(values).success === false,
  )
  return firstIncompleteIndex === -1 ? steps.length - 1 : firstIncompleteIndex
}

type PostingCreateFormProps = {
  hasInterview: boolean
  savedOrganizationId: string | undefined
  defaultValues?: PostingCreateValues
  // 이어서 작성할 때 불러온 공고, 없으면 첫 저장에서 공고 생성
  savedDraft?: SavedPostingDraft
}

function PostingCreateForm({
  hasInterview,
  savedOrganizationId,
  defaultValues = EMPTY_POSTING_CREATE,
  savedDraft,
}: PostingCreateFormProps) {
  // 입력 칸 안내 문구는 지원서 작성과 같이 칸을 벗어난 뒤부터 표시
  const { control, register, getValues, setValue } = useForm<PostingCreateValues>({
    defaultValues,
    mode: 'onTouched',
  })
  const values = useWatch({ control })
  const [recruitType, positions] = useWatch({ control, name: ['recruitType', 'positions'] })
  const steps = getPostingCreateSteps(hasInterview)
  const [stepIndex, setStepIndex] = useState(0)
  const [furthestIndex, setFurthestIndex] = useState(() =>
    savedDraft ? getInitialFurthestIndex(steps, defaultValues, hasInterview) : 0,
  )
  const { showToast } = useToast()
  const { currentOrganizationId } = useCurrentOrganization(savedOrganizationId)
  const { postingId, saveState, isSaving, canSave, saveStep } = usePostingDraftSave({
    organizationId: currentOrganizationId,
    hasInterview,
    savedDraft,
  })
  const currentStepId = steps[stepIndex]?.id
  const canGoNext = getStepSchema(currentStepId, hasInterview)?.safeParse(values).success ?? false
  const positionNames = getPositionNames({ recruitType, positions })
  const isReviewStep = currentStepId === 'review'

  // 검토 단계는 입력이 없어 저장할 값 없음
  async function saveCurrentStep() {
    if (!currentStepId || currentStepId === 'review') {
      return true
    }
    return saveStep(currentStepId, getValues())
  }

  // 첫 저장이 공고 생성이라 제목이 있어야 저장 가능
  async function handleTemporarySave() {
    if (!postingId && !getValues('title').trim()) {
      showToast({ title: '공고 제목을 입력하면 임시 저장할 수 있어요', icon: 'info' })
      return
    }
    if (await saveCurrentStep()) {
      showToast({
        title: '임시 저장되었습니다',
        description: '공고 관리 탭에서 언제든 이어 쓸 수 있어요',
      })
    }
  }

  // 검사할 스키마가 없는 단계는 통과
  function isStepComplete(index: number) {
    return getStepSchema(steps[index]?.id, hasInterview)?.safeParse(values).success ?? true
  }

  // 지원서 양식으로 들어갈 때 포지션 수에 맞춰 문항 묶음 정리
  function syncQuestionSets() {
    const { questionSets, recruitType, positions } = getValues()
    const setCount = recruitType === 'position' ? positions.length : 1
    setValue('questionSets', resizeQuestionSets(questionSets, setCount))
    if (setCount > questionSets.length) {
      showToast({ title: `기본 문항 ${DEFAULT_QUESTION_TITLES.length}개를 추가했어요` })
    }
  }

  // 면접 시간 설정으로 들어갈 때 바뀐 발표일 기준으로 기간 밖 날짜와 그 날 시간 정리
  function syncInterviewSchedule() {
    const { interviewDates, interviewSlots, documentResultDate, finalResultDate } = getValues()
    const dates = filterDatesInInterviewPeriod(interviewDates, documentResultDate, finalResultDate)
    setValue('interviewDates', dates)
    setValue(
      'interviewSlots',
      interviewSlots.filter((slot) => dates.includes(getSlotDate(slot))),
    )
  }

  function moveToStep(index: number) {
    const formIndex = steps.findIndex((step) => step.id === 'form')
    if (stepIndex < formIndex && index >= formIndex) {
      syncQuestionSets()
    }
    const interviewIndex = steps.findIndex((step) => step.id === 'interview')
    if (interviewIndex !== -1 && stepIndex < interviewIndex && index >= interviewIndex) {
      syncInterviewSchedule()
    }
    setStepIndex(index)
    setFurthestIndex(Math.max(furthestIndex, index))
    window.scrollTo({ top: 0 })
  }

  // 저장에 실패하면 현재 단계에 머묾
  async function saveAndMoveToStep(index: number) {
    if (isSaving) {
      return
    }
    if (await saveCurrentStep()) {
      moveToStep(index)
    }
  }

  function handleNext() {
    if (canGoNext && !isReviewStep) {
      void saveAndMoveToStep(stepIndex + 1)
    }
  }

  const { publish, isPublishing } = usePostingPublish({
    stepIds: steps.map(({ id }) => id),
    onInvalidStep: (stepId) => moveToStep(steps.findIndex(({ id }) => id === stepId)),
  })

  function handleEditStep(stepId: EditableStepId) {
    moveToStep(steps.findIndex((step) => step.id === stepId))
  }

  return (
    <div className="flex flex-col gap-gap-xl">
      <PageHeader
        title="공고 작성"
        actions={
          <div className="flex items-center gap-gap-m">
            <Button
              variant="secondary"
              size="m"
              disabled={!canSave || isSaving}
              onClick={() => void handleTemporarySave()}
            >
              임시 저장
            </Button>
            {isReviewStep ? (
              <PostingPublishDialog
                isPublishing={isPublishing}
                onPublish={() => publish(postingId)}
              />
            ) : (
              <Button size="m" disabled={!canGoNext || !canSave || isSaving} onClick={handleNext}>
                다음
                <ArrowRightIcon aria-hidden />
              </Button>
            )}
          </div>
        }
      />
      <div className="flex items-center justify-between gap-gap-l">
        <StepList
          label="공고 작성 단계"
          steps={steps}
          currentIndex={stepIndex}
          stepSelection={{
            furthestIndex,
            isStepComplete,
            onSelect: (index) => void saveAndMoveToStep(index),
          }}
        />
        <SaveStatus {...saveState} />
      </div>
      {currentStepId === 'info' && <PostingInfoStep control={control} register={register} />}
      {currentStepId === 'schedule' && (
        <PostingScheduleStep control={control} hasInterview={hasInterview} />
      )}
      {currentStepId === 'method' && <PostingMethodStep control={control} />}
      {currentStepId === 'interview' && <PostingInterviewStep control={control} />}
      {currentStepId === 'form' && (
        <PostingFormStep control={control} positionNames={positionNames} />
      )}
      {isReviewStep && (
        <PostingReviewStep
          values={getValues()}
          hasInterview={hasInterview}
          onEditStep={handleEditStep}
        />
      )}
    </div>
  )
}

export { PostingCreateForm }
