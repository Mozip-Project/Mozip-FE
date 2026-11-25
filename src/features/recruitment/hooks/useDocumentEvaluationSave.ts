import { useEffect, useEffectEvent, useRef, useState } from 'react'
import type { SaveState } from '@/components/ui/SaveStatus/saveStatus'
import { useSaveDocEvaluationMutation } from '@/features/recruitment/api/organizer/queries'
import type { DocumentEvaluationValues } from '@/features/recruitment/schemas/documentEvaluationSchema'
import { toSaveDocEvaluationInput } from '@/features/recruitment/utils/documentEvaluation'
import { useAutoSave } from '@/hooks/useAutoSave'
import { ApiError } from '@/lib/apiError'
import type { UseFormReturn } from 'react-hook-form'

// TODO: 자동 저장 간격 디자이너·기획 확인, 지원서 작성 화면과 같은 임시 값
const AUTO_SAVE_DELAY_MS = 3000
const INVALID_INPUT_CODE = 'COMMON_400'

// 클릭으로 고르는 의견·점수는 바로 저장, 메모는 입력을 멈춘 뒤 저장
function isInstantSaveField(name: string) {
  return name === 'opinion' || name.startsWith('scores.')
}

type UseDocumentEvaluationSaveOptions = {
  postingId: string
  applicationId: string
  form: UseFormReturn<DocumentEvaluationValues>
  // 점수 안 쓰는 공고는 null
  scoreQuestionIds: readonly string[] | null
  // 마지막 저장 시각, 평가 전이면 null
  savedAt: string | null
  // 자동 저장은 DRAFT로 바꾸므로 저장 완료(SAVED)·결과 확정 후에는 끔
  canAutoSave: boolean
}

// 고르거나 입력을 멈추면 자동 저장(DRAFT), 저장 버튼은 저장 완료(SAVED)
function useDocumentEvaluationSave({
  postingId,
  applicationId,
  form,
  scoreQuestionIds,
  savedAt,
  canAutoSave,
}: UseDocumentEvaluationSaveOptions) {
  const { mutateAsync: saveEvaluation } = useSaveDocEvaluationMutation(postingId)
  const [saveState, setSaveState] = useState<SaveState>(() =>
    savedAt ? { status: 'saved', savedAt: new Date(savedAt) } : { status: 'idle' },
  )
  // 저장하지 않은 입력, 화면을 떠날 때 남아 있으면 바로 자동 저장
  const hasUnsavedChangeRef = useRef(false)
  // 저장 버튼 요청 중이거나 저장 완료한 뒤, 자동 저장(DRAFT)이 저장 완료를 덮지 않도록 막음
  const isSubmitLockedRef = useRef(false)

  // TODO: 점수 오류의 field 형식 백엔드 확인 필요, 지금은 의견 오류만 입력 옆에 표시
  function showInputErrors(error: unknown) {
    if (!(error instanceof ApiError) || error.code !== INVALID_INPUT_CODE) {
      return
    }
    error.fieldErrors.forEach(({ field, message }) => {
      if (field.split(/[.[]/)[0] === 'opinion') {
        form.setError('opinion', { type: 'server', message })
      }
    })
  }

  async function save(submit: boolean) {
    hasUnsavedChangeRef.current = false
    setSaveState({ status: 'saving' })
    try {
      const payload = await saveEvaluation({
        input: toSaveDocEvaluationInput(applicationId, form.getValues(), scoreQuestionIds),
        submit,
      })
      setSaveState({ status: 'saved', savedAt: new Date(payload.evaluation.updatedAt) })
      return payload
    } catch (error) {
      setSaveState({ status: 'failed' })
      showInputErrors(error)
      return null
    }
  }

  const { scheduleSave, saveNow, cancelScheduledSave, waitForSave } = useAutoSave(
    AUTO_SAVE_DELAY_MS,
    async () => {
      await save(false)
    },
  )

  // 값을 바꾼 입력만 저장, 검사(trigger)처럼 입력 이름 없는 알림은 무시
  const handleFormChange = useEffectEvent((name: string | undefined) => {
    if (!canAutoSave || !name) {
      return
    }
    hasUnsavedChangeRef.current = true
    if (isSubmitLockedRef.current) {
      return
    }
    if (isInstantSaveField(name)) {
      void saveNow()
    } else {
      scheduleSave()
    }
  })
  const { subscribe } = form

  useEffect(
    () =>
      subscribe({ formState: { values: true }, callback: ({ name }) => handleFormChange(name) }),
    [subscribe],
  )

  const saveOnLeave = useEffectEvent(() => {
    if (canAutoSave && !isSubmitLockedRef.current && hasUnsavedChangeRef.current) {
      void save(false)
    }
  })
  useEffect(() => () => saveOnLeave(), [])

  // 대기 중인 자동 저장 대신 저장 완료로 저장, 저장 실패면 null
  async function submitEvaluation() {
    cancelScheduledSave()
    await waitForSave()
    isSubmitLockedRef.current = true
    const payload = await save(true)
    // 실패하면 다시 자동 저장, 요청 중 바꾼 입력은 다음 입력이나 이탈 때 저장
    isSubmitLockedRef.current = payload !== null
    return payload
  }

  return { saveState, submitEvaluation }
}

export { useDocumentEvaluationSave }
