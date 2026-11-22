'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import ArrowRightIcon from '@/assets/icons/arrowRight.svg'
import { Button } from '@/components/ui/Button/button'
import { PageHeader } from '@/components/ui/PageHeader/pageHeader'
import { SaveStatus, type SaveState } from '@/components/ui/SaveStatus/saveStatus'
import { StepList } from '@/components/ui/StepList/stepList'
import type { PostingPosition, PostingQuestion } from '@/features/posting/types'
import { getPostingApplyPath, getPostingDetailPath } from '@/features/posting/utils/postingRoutes'
import {
  createApplicationAnswerSchema,
  createEmptyApplicationAnswers,
  type ApplicationAnswerValues,
} from '@/features/recruitment/schemas/applicationAnswerSchema'
import {
  createApplicationInfoSchema,
  EMPTY_APPLICATION_INFO,
  type ApplicationInfoValues,
} from '@/features/recruitment/schemas/applicationInfoSchema'
import type { ApplicantProfile } from '@/features/recruitment/types'
import { hasOverLimitTextAnswer } from '@/features/recruitment/utils/applicationAnswer'
import { useLeaveConfirm } from '@/hooks/useLeaveConfirm'
import { getHrefWithSearchParams } from '@/utils/searchParams'
import { ApplicationAnswerStep } from './applicationAnswerStep'
import { ApplicationInfoStep } from './applicationInfoStep'
import { ApplicationLeaveDialog } from './applicationLeaveDialog'
import { ApplicationSubmitDialog } from './applicationSubmitDialog'
import type { Route } from 'next'

const APPLICATION_STEPS = [
  { id: 'info', label: '지원 정보 확인' },
  { id: 'form', label: '지원서 작성' },
] as const

const INFO_STEP_INDEX = 0
const ANSWER_STEP_INDEX = 1
const ANSWER_STEP_PARAM = '2'

function getStepHref(postingId: string, searchParams: URLSearchParams, stepIndex: number) {
  const nextParams = new URLSearchParams(searchParams)

  if (stepIndex === ANSWER_STEP_INDEX) {
    nextParams.set('step', ANSWER_STEP_PARAM)
  } else {
    nextParams.delete('step')
  }
  return getHrefWithSearchParams(getPostingApplyPath(postingId), nextParams)
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
}

function ApplicationForm({
  postingId,
  postingTitle,
  positions,
  questions,
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
  const {
    control: infoControl,
    formState: { isDirty: isInfoDirty },
    getValues: getInfoValues,
    reset: resetInfo,
  } = useForm<ApplicationInfoValues>({
    mode: 'onTouched',
    resolver: zodResolver(infoSchema),
    defaultValues: EMPTY_APPLICATION_INFO,
  })
  const infoValues = useWatch({ control: infoControl })
  const selectedQuestions = positions
    ? (positions.find((position) => position.id === infoValues.positionId)?.questions ?? [])
    : questions
  // 포지션마다 문항이 달라 모든 포지션 문항의 빈 답변을 한 번만 생성, 포지션을 오가도 포지션별 답변 유지
  const [initialAnswers] = useState(() =>
    createEmptyApplicationAnswers(
      positions ? positions.flatMap((position) => position.questions) : questions,
    ),
  )
  const answerSchema = createApplicationAnswerSchema(selectedQuestions)
  // 한 번 벗어난 문항부터 에러 표시
  const {
    control: answerControl,
    formState: { isDirty: isAnswerDirty },
    getValues: getAnswerValues,
    reset: resetAnswers,
    handleSubmit: handleAnswerSubmit,
  } = useForm<ApplicationAnswerValues>({
    mode: 'onTouched',
    resolver: zodResolver(answerSchema),
    defaultValues: initialAnswers,
  })
  // 답변이 바뀌면 다시 그리도록 구독, compute는 포지션을 바꿔도 다시 계산되지 않아 렌더링 때 판단
  useWatch({ control: answerControl })
  const answerValues = getAnswerValues()
  const canSubmit =
    answerSchema.safeParse(answerValues).success &&
    !hasOverLimitTextAnswer(selectedQuestions, answerValues)

  const [saveState, setSaveState] = useState<SaveState>({ status: 'idle' })
  const [visitedStepIndex, setVisitedStepIndex] = useState(INFO_STEP_INDEX)
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false)

  const searchParams = useSearchParams()
  const router = useRouter()

  // 마지막 임시 저장 뒤 바뀐 값이 있을 때만 이탈 확인
  const { pendingHref, cancelLeave } = useLeaveConfirm(isInfoDirty || isAnswerDirty)

  const isInfoComplete = infoSchema.safeParse(infoValues).success
  const isAnswerStepRequested = searchParams.get('step') === ANSWER_STEP_PARAM
  // 지원 정보를 다 채우지 않은 채 2단계 주소로 들어오면 1단계 표시
  const currentStepIndex =
    isAnswerStepRequested && isInfoComplete ? ANSWER_STEP_INDEX : INFO_STEP_INDEX
  const isStepParamInvalid = isAnswerStepRequested && !isInfoComplete

  // 단계 이동은 서버 요청·재마운트 없이 URL만 바꿔 입력값 유지
  function moveToStep(stepIndex: number) {
    window.history.pushState(null, '', getStepHref(postingId, searchParams, stepIndex))
    window.scrollTo({ top: 0 })
    setVisitedStepIndex((visited) => Math.max(visited, stepIndex))
  }

  // 보이는 단계와 주소를 맞춰 [다음]이 같은 주소를 기록에 한 번 더 쌓지 않도록 처리
  useEffect(() => {
    if (isStepParamInvalid) {
      window.history.replaceState(null, '', getStepHref(postingId, searchParams, INFO_STEP_INDEX))
    }
  }, [isStepParamInvalid, postingId, searchParams])

  // TODO: 임시 저장 API 연결, 지금은 저장한 값을 이탈 확인 기준으로만 사용
  function handleTemporarySave() {
    // 보이던 오류가 저장 후에도 남도록 오류, 벗어난 칸 기록 유지
    resetInfo(getInfoValues(), { keepErrors: true, keepTouched: true })
    resetAnswers(getAnswerValues(), { keepErrors: true, keepTouched: true })
    setSaveState({ status: 'saved', savedAt: new Date() })
  }

  function handleSubmitClick() {
    void handleAnswerSubmit(() => setIsSubmitDialogOpen(true))()
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
      <PageHeader
        backLink={{ href: getPostingDetailPath(postingId), label: '공고 상세' }}
        title={postingTitle}
        actions={
          <div className="flex items-center gap-gap-m">
            <Button variant="secondary" size="m" onClick={handleTemporarySave}>
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
            furthestIndex: Math.max(visitedStepIndex, currentStepIndex),
            isStepComplete: (stepIndex) => stepIndex === INFO_STEP_INDEX && isInfoComplete,
            onSelect: moveToStep,
          }}
        />
        <SaveStatus {...saveState} />
      </div>

      {currentStepIndex === INFO_STEP_INDEX ? (
        <ApplicationInfoStep
          control={infoControl}
          positions={positions}
          profile={profile}
          requiresProfilePhoto={requiresProfilePhoto}
        />
      ) : (
        <ApplicationAnswerStep control={answerControl} questions={selectedQuestions} />
      )}

      <ApplicationSubmitDialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen} />
      <ApplicationLeaveDialog
        open={pendingHref !== null}
        onStay={cancelLeave}
        onLeave={handleLeave}
      />
    </div>
  )
}

export { ApplicationForm }
