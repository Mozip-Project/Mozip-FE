'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import ArrowRightIcon from '@/assets/icons/arrowRight.svg'
import { BackLink } from '@/components/ui/BackLink/backLink'
import { Button } from '@/components/ui/Button/button'
import { PageHeader } from '@/components/ui/PageHeader/pageHeader'
import { SaveStatus } from '@/components/ui/SaveStatus/saveStatus'
import { StepList } from '@/components/ui/StepList/stepList'
import { StickyTopBar } from '@/components/ui/StickyTopBar/stickyTopBar'
import type { PostingPosition, PostingQuestion } from '@/features/posting/types'
import { getPostingDetailPath } from '@/features/posting/utils/postingRoutes'
import { ApplicationAnswerStep } from '@/features/recruitment/components/applicant/applicationAnswerStep/applicationAnswerStep'
import { ApplicationInfoStep } from '@/features/recruitment/components/applicant/applicationInfoStep/applicationInfoStep'
import { useApplicationDraftSave } from '@/features/recruitment/hooks/useApplicationDraftSave'
import {
  ANSWER_STEP_INDEX,
  INFO_STEP_INDEX,
  useApplicationStep,
} from '@/features/recruitment/hooks/useApplicationStep'
import { useApplicationSubmit } from '@/features/recruitment/hooks/useApplicationSubmit'
import {
  createApplicationAnswerSchema,
  type ApplicationAnswerValues,
} from '@/features/recruitment/schemas/applicationAnswerSchema'
import {
  createApplicationInfoSchema,
  EMPTY_APPLICATION_INFO,
  type ApplicationInfoValues,
} from '@/features/recruitment/schemas/applicationInfoSchema'
import type { ApplicantProfile } from '@/features/recruitment/types'
import { hasOverLimitTextAnswer } from '@/features/recruitment/utils/applicationAnswer'
import {
  toApplicationFormInitialValues,
  type MyApplicationResponse,
} from '@/features/recruitment/utils/applicationDraft'
import { toApplicationInput } from '@/features/recruitment/utils/applicationInput'
import { useLeaveConfirm } from '@/hooks/useLeaveConfirm'
import { useStickyTopBarHeight } from '@/hooks/useStickyTopBarHeight'
import { ApplicationLeaveDialog } from './applicationLeaveDialog'
import { ApplicationSubmitDialog } from './applicationSubmitDialog'
import type { Route } from 'next'

const APPLICATION_STEPS = [
  { id: 'info', label: '지원 정보 확인' },
  { id: 'form', label: '지원서 작성' },
] as const

function getPositionQuestions(
  positions: readonly PostingPosition[] | null,
  questions: readonly PostingQuestion[],
  positionId: string | undefined,
) {
  return positions
    ? (positions.find((position) => position.id === positionId)?.questions ?? [])
    : questions
}

type ApplicationFormProps = {
  postingId: string
  postingTitle: string
  // null은 포지션 없는 모집
  positions: readonly PostingPosition[] | null
  // 포지션 없는 모집의 문항
  questions: readonly PostingQuestion[]
  requiresProfilePhoto: boolean
  profile: ApplicantProfile
  // 이어 쓸 임시 저장 지원서, 없으면 null
  savedDraft: MyApplicationResponse | null
}

function ApplicationForm({
  postingId,
  postingTitle,
  positions,
  questions,
  requiresProfilePhoto,
  profile,
  savedDraft,
}: ApplicationFormProps) {
  // 포지션마다 문항이 달라 모든 포지션 문항의 답변 칸을 한 번만 생성, 포지션을 오가도 포지션별 답변 유지
  const [initialValues] = useState(() =>
    toApplicationFormInitialValues({ positions, questions, savedDraft }),
  )
  const infoSchema = createApplicationInfoSchema({
    selectablePositionIds:
      positions?.filter((position) => position.appliedAt === null).map((position) => position.id) ??
      null,
    requiresProfilePhoto,
    hasSavedPhoto: profile.savedPhotoUrl !== null,
  })
  // 한 번 벗어난 필드부터 에러 표시
  const infoForm = useForm<ApplicationInfoValues>({
    mode: 'onTouched',
    resolver: zodResolver(infoSchema),
    // 학과·학년은 이어 쓰기에서도 매번 새로 입력, 사진은 업로드 API 전이라 빈칸
    defaultValues: { ...EMPTY_APPLICATION_INFO, positionId: initialValues.positionId },
  })
  const infoValues = useWatch({ control: infoForm.control })
  const selectedQuestions = getPositionQuestions(positions, questions, infoValues.positionId)
  const answerSchema = createApplicationAnswerSchema(selectedQuestions)
  // 한 번 벗어난 문항부터 에러 표시
  const answerForm = useForm<ApplicationAnswerValues>({
    mode: 'onTouched',
    resolver: zodResolver(answerSchema),
    defaultValues: initialValues.answers,
  })
  // 답변이 바뀌면 다시 그리도록 구독, compute는 포지션을 바꿔도 다시 계산되지 않아 렌더링 때 판단
  useWatch({ control: answerForm.control })
  const answerValues = answerForm.getValues()
  const canSubmit =
    answerSchema.safeParse(answerValues).success &&
    !hasOverLimitTextAnswer(selectedQuestions, answerValues)
  const isInfoComplete = infoSchema.safeParse(infoValues).success

  // TODO: 학과·학년·사진은 저장 입력에 칸이 없어 백엔드 확인 전까지 안 보냄
  // 타이머에서도 불러 렌더링 때 계산한 문항 대신 지금 고른 포지션 문항 사용
  function getApplicationInput(info: ApplicationInfoValues, answers: ApplicationAnswerValues) {
    return toApplicationInput({
      positionId: info.positionId,
      questions: getPositionQuestions(positions, questions, info.positionId),
      answers,
    })
  }

  const { currentStepIndex, furthestStepIndex, moveToStep } = useApplicationStep({
    postingId,
    isInfoComplete,
  })
  const { saveState, isSavingDraft, saveNow, cancelScheduledSave, waitForSave } =
    useApplicationDraftSave({
      postingId,
      savedDraftUpdatedAt: savedDraft?.updatedAt ?? null,
      infoForm,
      answerForm,
      getInput: getApplicationInput,
    })
  const { submit, isSubmitting } = useApplicationSubmit(postingId)
  const [isWaitingForSave, setIsWaitingForSave] = useState(false)
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false)

  const router = useRouter()
  // 마지막 임시 저장 뒤 바뀐 값이 있을 때만 이탈 확인
  const { pendingHref, cancelLeave } = useLeaveConfirm(
    infoForm.formState.isDirty || answerForm.formState.isDirty,
  )
  const stickyHeaderRef = useRef<HTMLDivElement>(null)
  useStickyTopBarHeight(stickyHeaderRef)

  const { getValues: getAnswerValues, reset: resetAnswers } = answerForm

  // 답변 오류, 벗어난 기록을 지워 돌아왔을 때 처음 상태로 표시, 바뀐 값 기록은 유지
  useEffect(() => {
    if (currentStepIndex === INFO_STEP_INDEX) {
      resetAnswers(getAnswerValues(), { keepDefaultValues: true, keepDirty: true })
    }
  }, [currentStepIndex, getAnswerValues, resetAnswers])

  function handleTemporarySave() {
    void saveNow()
  }

  function handleSubmitClick() {
    void answerForm.handleSubmit(() => setIsSubmitDialogOpen(true))()
  }

  // 제출이 지금 입력을 저장하므로 대기 중인 자동 저장은 취소
  // 이미 보낸 저장은 끝난 뒤 제출해 늦게 끝난 저장이 제출 내용을 덮지 않도록 처리
  async function handleSubmitConfirm() {
    cancelScheduledSave()
    setIsWaitingForSave(true)
    await waitForSave()
    setIsWaitingForSave(false)
    submit(getApplicationInput(infoForm.getValues(), answerForm.getValues()))
  }

  function handleLeave() {
    if (!pendingHref) {
      return
    }
    cancelLeave()
    router.push(pendingHref as Route)
  }

  return (
    <div className="mx-auto flex max-w-195 flex-col gap-gap-xl">
      <BackLink
        href={getPostingDetailPath(postingId)}
        label="공고 상세"
        className="-mb-[calc(var(--spacing-gap-xl)-var(--spacing-gap-s))] self-start"
      />
      <StickyTopBar className="-mb-gap-xl">
        <div ref={stickyHeaderRef} className="flex flex-col gap-gap-xl pb-gap-xl">
          <PageHeader
            title={postingTitle}
            actions={
              <div className="flex items-center gap-gap-m">
                <Button
                  variant="secondary"
                  size="m"
                  disabled={isSavingDraft}
                  onClick={handleTemporarySave}
                >
                  임시 저장
                </Button>
                {currentStepIndex === INFO_STEP_INDEX ? (
                  <Button
                    size="m"
                    disabled={!isInfoComplete}
                    onClick={() => moveToStep(ANSWER_STEP_INDEX)}
                  >
                    다음
                    <ArrowRightIcon aria-hidden />
                  </Button>
                ) : (
                  <Button size="m" disabled={!canSubmit} onClick={handleSubmitClick}>
                    지원서 제출
                  </Button>
                )}
              </div>
            }
          />
          <div className="flex items-center justify-between gap-gap-l">
            <StepList
              label="지원 단계"
              steps={APPLICATION_STEPS}
              currentIndex={currentStepIndex}
              stepSelection={{
                furthestIndex: furthestStepIndex,
                isStepComplete: (stepIndex) => stepIndex === INFO_STEP_INDEX && isInfoComplete,
                onSelect: moveToStep,
              }}
            />
            <SaveStatus {...saveState} />
          </div>
        </div>
      </StickyTopBar>

      {currentStepIndex === INFO_STEP_INDEX ? (
        <ApplicationInfoStep
          control={infoForm.control}
          positions={positions}
          profile={profile}
          requiresProfilePhoto={requiresProfilePhoto}
        />
      ) : (
        <ApplicationAnswerStep control={answerForm.control} questions={selectedQuestions} />
      )}

      <ApplicationSubmitDialog
        open={isSubmitDialogOpen}
        onOpenChange={setIsSubmitDialogOpen}
        isSubmitting={isWaitingForSave || isSubmitting}
        onSubmit={() => void handleSubmitConfirm()}
      />
      <ApplicationLeaveDialog
        open={pendingHref !== null}
        onStay={cancelLeave}
        onLeave={handleLeave}
      />
    </div>
  )
}

export { ApplicationForm }
