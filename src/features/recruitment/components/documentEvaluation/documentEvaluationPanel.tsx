'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useEffect, useId, type FormEvent } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { SegmentGroup } from '@/components/ui/SegmentGroup/segmentGroup'
import { SegmentOption } from '@/components/ui/SegmentGroup/segmentOption'
import { TextArea } from '@/components/ui/TextArea/textArea'
import {
  createSubmitSchema,
  OPINIONS,
  type DocumentEvaluationValues,
  type Opinion,
} from '@/features/recruitment/schemas/documentEvaluationSchema'
import { useToast } from '@/providers/toastProvider'
import { EvaluationPanelFooter } from './evaluationPanelFooter'
import { EvaluationPanelHeader } from './evaluationPanelHeader'
import { ScoreField, type ScoreQuestion } from './scoreField'
import type { Route } from 'next'

const MEMO_MAX_LENGTH = 300

const OPINION_OPTION = {
  pass: { label: '합격', tone: 'brand' },
  hold: { label: '보류', tone: 'warning' },
  fail: { label: '불합격', tone: 'critical' },
} as const satisfies Record<Opinion, { label: string; tone: string }>

const EMPTY_EVALUATION: DocumentEvaluationValues = { opinion: '', scores: {}, memo: '' }

type NextApplicant = {
  href: Route
  isWrapped: boolean
}

type DocumentEvaluationPanelProps = {
  applicantName: string
  scoreQuestions: readonly ScoreQuestion[]
  // TODO: 평가 API 연결 후 서버에 임시저장된 평가로 교체, 처음 보는 지원자는 null
  savedEvaluation: DocumentEvaluationValues | null
  nextApplicant: NextApplicant | null
}

function getSavedToastTitle(applicantName: string, isWrapped: boolean) {
  const savedMessage = `${applicantName}님 평가를 저장했어요`
  return isWrapped ? `${savedMessage}. 남은 지원자로 이동했어요` : savedMessage
}

function DocumentEvaluationPanel({
  applicantName,
  scoreQuestions,
  savedEvaluation,
  nextApplicant,
}: DocumentEvaluationPanelProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const opinionLabelId = useId()
  const memoId = useId()
  const { control, trigger } = useForm<DocumentEvaluationValues>({
    mode: 'onChange',
    resolver: zodResolver(createSubmitSchema(scoreQuestions.map(({ id }) => id))),
    defaultValues: savedEvaluation ?? EMPTY_EVALUATION,
  })

  // 임시저장된 평가로 다시 들어오면 빠진 필수 항목 표시
  useEffect(() => {
    if (savedEvaluation) {
      void trigger()
    }
  }, [savedEvaluation, trigger])

  function handleSaveAndMoveNext(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // TODO: 평가 저장 API 연결

    // TODO: 전체 평가 완료 모달 연결
    if (!nextApplicant) {
      return
    }

    showToast({ title: getSavedToastTitle(applicantName, nextApplicant.isWrapped) })
    router.push(nextApplicant.href)
  }

  return (
    <section className="flex w-100 shrink-0 flex-col gap-gap-xl rounded-l border border-neutral-muted bg-layer-default p-padding-xl">
      <EvaluationPanelHeader saveState={{ status: 'idle' }} />
      <form onSubmit={handleSaveAndMoveNext} className="flex flex-col gap-gap-xl">
        <div className="flex flex-col gap-gap-s">
          <p id={opinionLabelId} className="text-label1 font-semibold text-neutral-muted">
            의견
          </p>
          <Controller
            name="opinion"
            control={control}
            render={({ field }) => (
              <SegmentGroup
                aria-labelledby={opinionLabelId}
                value={field.value}
                onValueChange={field.onChange}
              >
                {OPINIONS.map((opinion) => (
                  <SegmentOption key={opinion} value={opinion} tone={OPINION_OPTION[opinion].tone}>
                    {OPINION_OPTION[opinion].label}
                  </SegmentOption>
                ))}
              </SegmentGroup>
            )}
          />
        </div>
        <ScoreField questions={scoreQuestions} control={control} />
        <div className="flex flex-col gap-gap-s">
          <label htmlFor={memoId} className="text-label1 font-semibold text-neutral-muted">
            메모 (선택)
          </label>
          <Controller
            name="memo"
            control={control}
            render={({ field }) => (
              <TextArea
                {...field}
                id={memoId}
                placeholder="지원자에 대해 남길 메모를 적어 주세요. 다른 운영진의 평가는 서류 평가 취합에서 볼 수 있어요."
                maxLength={MEMO_MAX_LENGTH}
              />
            )}
          />
        </div>
        <EvaluationPanelFooter mode="next" type="submit" />
      </form>
    </section>
  )
}

export { DocumentEvaluationPanel }
