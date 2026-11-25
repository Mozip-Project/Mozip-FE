'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import type { ScoreQuestion } from '@/features/recruitment/components/organizer/documentEvaluationPanel/scoreField'
import {
  useApplicantNavigation,
  useDocumentEvaluationChips,
} from '@/features/recruitment/hooks/useDocumentEvaluationChips'
import { useDocumentEvaluationSave } from '@/features/recruitment/hooks/useDocumentEvaluationSave'
import {
  createSubmitSchema,
  type DocumentEvaluationValues,
} from '@/features/recruitment/schemas/documentEvaluationSchema'
import { toDocumentEvaluationValues } from '@/features/recruitment/utils/documentEvaluation'
import { findNextApplicantToEvaluate } from '@/features/recruitment/utils/nextApplicant'
import type { MyDocEvaluationFieldsFragment } from '@/gql/graphql'
import { useToast } from '@/providers/toastProvider'

function getSavedToastTitle(applicantName: string, isWrapped: boolean) {
  const savedMessage = `${applicantName}님 평가를 저장했어요`
  return isWrapped ? `${savedMessage}. 남은 지원자로 이동했어요` : savedMessage
}

type UseDocumentEvaluationFormOptions = {
  postingId: string
  applicantId: string
  applicantName: string
  // 점수 안 쓰는 공고는 빈 목록
  scoreQuestions: readonly ScoreQuestion[]
  // 평가 전이면 null, 저장할 때마다 캐시로 갱신
  evaluation: MyDocEvaluationFieldsFragment | null
  isConfirmed: boolean
  // 처음 저장으로 남은 지원자가 0명이 된 때
  onAllEvaluated: () => void
}

// 평가 폼과 저장 흐름, 서버 저장·자동 저장은 useDocumentEvaluationSave
function useDocumentEvaluationForm({
  postingId,
  applicantId,
  applicantName,
  scoreQuestions,
  evaluation,
  isConfirmed,
  onAllEvaluated,
}: UseDocumentEvaluationFormOptions) {
  const { showToast } = useToast()
  const { applicants } = useDocumentEvaluationChips(postingId)
  const goToApplicant = useApplicantNavigation(postingId)
  const scoreQuestionIds = scoreQuestions.map(({ id }) => id)
  // 처음 연 평가 상태, 이어 쓰는 작성 중 평가면 빠진 필수 항목 표시, 결과 확정 뒤엔 읽기 전용이라 표시 안 함
  const [isDraftOnOpen] = useState(evaluation?.status === 'DRAFT' && !isConfirmed)
  const form = useForm<DocumentEvaluationValues>({
    mode: 'onChange',
    resolver: zodResolver(createSubmitSchema(scoreQuestionIds)),
    defaultValues: toDocumentEvaluationValues(evaluation),
  })
  const { control, trigger, handleSubmit } = form
  const isSaved = evaluation?.status === 'SAVED'
  const [opinion, scores] = useWatch({ control, name: ['opinion', 'scores'] })
  // 의견과 모든 문항 점수를 골라야 저장 가능, 메모는 선택
  const canSubmit = opinion !== '' && scoreQuestionIds.every((id) => Boolean(scores[id]))
  const { saveState, submitEvaluation } = useDocumentEvaluationSave({
    postingId,
    applicationId: applicantId,
    form,
    scoreQuestionIds: scoreQuestionIds.length > 0 ? scoreQuestionIds : null,
    savedAt: evaluation?.updatedAt ?? null,
    canAutoSave: !isSaved && !isConfirmed,
  })

  useEffect(() => {
    if (isDraftOnOpen) {
      void trigger()
    }
  }, [isDraftOnOpen, trigger])

  // 이미 저장한 평가를 고치면 그 자리에 머물고, 처음 저장하면 칩 순서로 다음 미평가 지원자로 이동
  async function saveAndMove() {
    const isRevisit = isSaved
    const payload = await submitEvaluation()
    if (!payload || isRevisit) {
      return
    }

    if (payload.remainingCount === 0) {
      onAllEvaluated()
      return
    }

    const next = applicants && findNextApplicantToEvaluate(applicants, applicantId)
    const nextId = next?.id ?? payload.nextUnevaluatedApplicationId
    if (!nextId) {
      return
    }

    showToast({ title: getSavedToastTitle(applicantName, next?.isWrapped ?? true) })
    goToApplicant(nextId)
  }

  return {
    form,
    saveState,
    isSaved,
    canSubmit,
    submitAndMove: handleSubmit(saveAndMove),
  }
}

export { useDocumentEvaluationForm }
