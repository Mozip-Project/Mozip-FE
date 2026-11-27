'use client'

import { useId, useState } from 'react'
import { Controller } from 'react-hook-form'
import { SegmentGroup } from '@/components/ui/SegmentGroup/segmentGroup'
import { SegmentOption } from '@/components/ui/SegmentGroup/segmentOption'
import { TextArea } from '@/components/ui/TextArea/textArea'
import {
  useMyDocEvaluationQuery,
  useRecruitmentPostingQuery,
} from '@/features/recruitment/api/organizer/queries'
import {
  DocumentEvaluationPanelSkeleton,
  EVALUATION_PANEL_CLASS,
} from '@/features/recruitment/components/organizer/documentEvaluation/documentEvaluationSkeleton'
import { useDocumentEvaluationApplication } from '@/features/recruitment/hooks/useDocumentEvaluationApplication'
import { useDocumentEvaluationChips } from '@/features/recruitment/hooks/useDocumentEvaluationChips'
import { useDocumentEvaluationForm } from '@/features/recruitment/hooks/useDocumentEvaluationForm'
import { OPINIONS, type Opinion } from '@/features/recruitment/schemas/documentEvaluationSchema'
import type { MyDocEvaluationFieldsFragment } from '@/gql/graphql'
import { DocumentEvaluationDoneDialog } from './documentEvaluationDoneDialog'
import { EvaluationPanelFooter } from './evaluationPanelFooter'
import { EvaluationPanelHeader } from './evaluationPanelHeader'
import { ScoreField, type ScoreQuestion } from './scoreField'

const MEMO_MAX_LENGTH = 300
const MEMO_PLACEHOLDER =
  '지원자에 대해 남길 메모를 적어 주세요. 다른 운영진의 평가는 서류 평가 취합에서 볼 수 있어요.'

const OPINION_OPTION = {
  pass: { label: '합격', tone: 'brand' },
  hold: { label: '보류', tone: 'warning' },
  fail: { label: '불합격', tone: 'critical' },
} as const satisfies Record<Opinion, { label: string; tone: string }>

type DocumentEvaluationPanelProps = {
  postingId: string
  applicantId: string
}

function DocumentEvaluationPanel({ postingId, applicantId }: DocumentEvaluationPanelProps) {
  const postingQuery = useRecruitmentPostingQuery(postingId)
  const evaluationQuery = useMyDocEvaluationQuery(postingId, applicantId)
  const { application, isError: isApplicationError } = useDocumentEvaluationApplication(
    postingId,
    applicantId,
  )

  // 지원서가 없으면 평가할 수 없어 패널 숨김, 오류 안내는 지원서 영역에서 표시
  if (isApplicationError) {
    return null
  }

  if (postingQuery.isError || evaluationQuery.isError) {
    return (
      <section className={EVALUATION_PANEL_CLASS}>
        <p role="alert" className="p-padding-xl text-body2 font-semibold text-neutral-muted">
          내 평가를 불러오지 못했어요
        </p>
      </section>
    )
  }

  if (!postingQuery.data || evaluationQuery.isPending || !application) {
    return <DocumentEvaluationPanelSkeleton />
  }

  return (
    <DocumentEvaluationForm
      postingId={postingId}
      applicantId={applicantId}
      applicantName={application.name}
      scoreQuestions={postingQuery.data.docScorePerQuestion ? application.scoreQuestions : []}
      evaluation={evaluationQuery.data}
      isConfirmed={Boolean(postingQuery.data.docResultConfirmedAt)}
    />
  )
}

type DocumentEvaluationFormProps = {
  postingId: string
  applicantId: string
  applicantName: string
  // 점수 안 쓰는 공고는 빈 목록
  scoreQuestions: readonly ScoreQuestion[]
  // 평가 전이면 null, 저장할 때마다 캐시로 갱신
  evaluation: MyDocEvaluationFieldsFragment | null
  isConfirmed: boolean
}

function DocumentEvaluationForm({
  postingId,
  applicantId,
  applicantName,
  scoreQuestions,
  evaluation,
  isConfirmed,
}: DocumentEvaluationFormProps) {
  const opinionLabelId = useId()
  const memoId = useId()
  const [isDoneDialogOpen, setIsDoneDialogOpen] = useState(false)
  const { applicants } = useDocumentEvaluationChips(postingId)
  // TODO: 결과 확정 후 평가 전 지원자 안내 화면 디자인 확인 필요, 지금은 빈 읽기 전용 패널
  const { form, saveState, isSaved, canSubmit, submitAndMove } = useDocumentEvaluationForm({
    postingId,
    applicantId,
    applicantName,
    scoreQuestions,
    evaluation,
    isConfirmed,
    onAllEvaluated: () => setIsDoneDialogOpen(true),
  })
  const { control, formState } = form
  // 저장 버튼 요청 중 바꾼 값은 저장되지 않고 다음 지원자로 넘어가 입력을 막음
  const isInputLocked = isConfirmed || formState.isSubmitting

  return (
    <section className={EVALUATION_PANEL_CLASS}>
      <div className="shrink-0 px-padding-xl pt-padding-xl">
        <EvaluationPanelHeader saveState={saveState} />
      </div>
      <form onSubmit={submitAndMove} className="flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 [scrollbar-width:none] flex-col gap-gap-xl overflow-y-auto p-padding-xl [&::-webkit-scrollbar]:hidden">
          <div className="flex flex-col gap-gap-s">
            <p id={opinionLabelId} className="text-label1 font-semibold text-neutral-muted">
              의견
            </p>
            <Controller
              name="opinion"
              control={control}
              render={({ field, fieldState }) => (
                <SegmentGroup
                  aria-labelledby={opinionLabelId}
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isInputLocked}
                  errorMessage={fieldState.error?.message}
                >
                  {OPINIONS.map((opinion) => (
                    <SegmentOption
                      key={opinion}
                      value={opinion}
                      tone={OPINION_OPTION[opinion].tone}
                    >
                      {OPINION_OPTION[opinion].label}
                    </SegmentOption>
                  ))}
                </SegmentGroup>
              )}
            />
          </div>
          {scoreQuestions.length > 0 && (
            <ScoreField questions={scoreQuestions} control={control} disabled={isInputLocked} />
          )}
          <div className="flex flex-col gap-gap-s">
            <label htmlFor={memoId} className="text-label1 font-semibold text-neutral-muted">
              {isConfirmed ? '메모' : '메모 (선택)'}
            </label>
            <Controller
              name="memo"
              control={control}
              render={({ field }) => (
                <TextArea
                  {...field}
                  id={memoId}
                  readOnly={isInputLocked}
                  placeholder={isConfirmed ? undefined : MEMO_PLACEHOLDER}
                  maxLength={MEMO_MAX_LENGTH}
                />
              )}
            />
          </div>
        </div>
        {!isConfirmed && (
          <div className="shrink-0 px-padding-xl pt-padding-s pb-padding-xl">
            <EvaluationPanelFooter
              mode={isSaved ? 'revisit' : 'next'}
              type="submit"
              disabled={!canSubmit || formState.isSubmitting}
            />
          </div>
        )}
      </form>
      <DocumentEvaluationDoneDialog
        postingId={postingId}
        applicantCount={applicants?.length}
        open={isDoneDialogOpen}
        onOpenChange={setIsDoneDialogOpen}
      />
    </section>
  )
}

export { DocumentEvaluationPanel }
