import { useEffect, useEffectEvent, useRef, useState } from 'react'
import type { SaveState } from '@/components/ui/SaveStatus/saveStatus'
import { useSaveApplicationDraftMutation } from '@/features/recruitment/api/applicant/queries'
import type { ApplicationAnswerValues } from '@/features/recruitment/schemas/applicationAnswerSchema'
import type { ApplicationInfoValues } from '@/features/recruitment/schemas/applicationInfoSchema'
import type { ApplicationInput } from '@/gql/graphql'
import { useAutoSave, type SaveTrigger } from '@/hooks/useAutoSave'
import { ApiError } from '@/lib/apiError'
import type { UseFormReturn } from 'react-hook-form'

// 다시 보내도 실패하는 저장 오류(이미 제출, 모집 기간 아님), 자동 저장 중단
const AUTO_SAVE_STOP_CODES = new Set(['APPLICATION_409', 'POSTING_409'])

// TODO: 자동 저장 간격 디자이너·기획 확인, 지금은 임시 값
const AUTO_SAVE_DELAY_MS = 3000

type UseApplicationDraftSaveOptions = {
  postingId: string
  // 이어 쓰는 임시 저장 지원서의 마지막 저장 시각, 없으면 null
  savedDraftUpdatedAt: string | null
  infoForm: UseFormReturn<ApplicationInfoValues>
  answerForm: UseFormReturn<ApplicationAnswerValues>
  getInput: (info: ApplicationInfoValues, answers: ApplicationAnswerValues) => ApplicationInput
}

function useApplicationDraftSave({
  postingId,
  savedDraftUpdatedAt,
  infoForm,
  answerForm,
  getInput,
}: UseApplicationDraftSaveOptions) {
  // 마지막으로 저장한 입력, 같으면 자동 저장 생략, 처음에는 불러온 값 그대로
  const [initialInputKey] = useState(() =>
    JSON.stringify(getInput(infoForm.getValues(), answerForm.getValues())),
  )
  const lastSavedInputKeyRef = useRef(initialInputKey)
  const isAutoSaveStoppedRef = useRef(false)
  const [saveState, setSaveState] = useState<SaveState>(() =>
    savedDraftUpdatedAt
      ? { status: 'saved', savedAt: new Date(savedDraftUpdatedAt) }
      : { status: 'idle' },
  )
  const { mutateAsync: saveDraft, isPending: isSavingDraft } = useSaveApplicationDraftMutation()

  // 수동 저장은 바뀐 게 없어도 저장, 자동 저장은 바뀐 입력이 있을 때만
  async function saveCurrentDraft(trigger: SaveTrigger) {
    const isAutoSave = trigger === 'auto'
    if (isAutoSave && isAutoSaveStoppedRef.current) {
      return
    }

    const savedInfo = infoForm.getValues()
    const savedAnswers = answerForm.getValues()
    const input = getInput(savedInfo, savedAnswers)
    const inputKey = JSON.stringify(input)
    if (isAutoSave && inputKey === lastSavedInputKeyRef.current) {
      return
    }

    setSaveState({ status: 'saving' })
    try {
      const { updatedAt } = await saveDraft({ postingId, input })
      lastSavedInputKeyRef.current = inputKey
      const keepState = { keepValues: true, keepErrors: true, keepTouched: true }

      infoForm.reset(savedInfo, keepState)
      answerForm.reset(savedAnswers, keepState)

      setSaveState({ status: 'saved', savedAt: new Date(updatedAt) })
    } catch (error) {
      if (error instanceof ApiError && AUTO_SAVE_STOP_CODES.has(error.code)) {
        isAutoSaveStoppedRef.current = true
      }
      setSaveState({ status: 'failed' })
    }
  }

  const { scheduleSave, saveNow, cancelScheduledSave, waitForSave } = useAutoSave(
    AUTO_SAVE_DELAY_MS,
    saveCurrentDraft,
  )

  const handleFormChange = useEffectEvent(scheduleSave)
  const { subscribe: subscribeInfo } = infoForm
  const { subscribe: subscribeAnswers } = answerForm

  // 지원 정보, 답변 어느 쪽이 바뀌어도 입력을 멈춘 뒤 자동 저장
  useEffect(() => {
    const unsubscribeInfo = subscribeInfo({
      formState: { values: true },
      callback: () => handleFormChange(),
    })
    const unsubscribeAnswers = subscribeAnswers({
      formState: { values: true },
      callback: () => handleFormChange(),
    })

    return () => {
      unsubscribeInfo()
      unsubscribeAnswers()
    }
  }, [subscribeInfo, subscribeAnswers])

  return { saveState, isSavingDraft, saveNow, cancelScheduledSave, waitForSave }
}

export { useApplicationDraftSave }
